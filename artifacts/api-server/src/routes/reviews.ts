import { Router, type IRouter } from "express";
import Anthropic from "@anthropic-ai/sdk";
import {
  FetchPRBody,
  ReviewPRBody,
  PostCommentsBody,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "ReviewBot-AI/1.0",
  };
  if (GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  }
  return headers;
}

const REVIEW_SYSTEM_PROMPT = `You are an elite code reviewer with expertise in security vulnerabilities, performance optimization, and software engineering best practices.

Analyze the provided PR diff and return a JSON array of review comments. Each comment must follow this exact structure:

{
  "id": "unique string id",
  "severity": "critical" | "warning" | "suggestion",
  "category": "security" | "bug" | "performance" | "code-quality" | "best-practice",
  "file": "filename string",
  "line": line number as integer,
  "title": "short 5-8 word title of the issue",
  "issue": "1-2 sentence description of exactly what is wrong",
  "fix": "the corrected code snippet only — no explanation, just working code",
  "explanation": "2-3 sentences explaining why this matters and what the fix achieves",
  "cwe": "CWE-XXX if security issue, else null"
}

Security checks (ALWAYS scan for these):
- SQL injection, NoSQL injection
- XSS and HTML injection
- Hardcoded secrets, API keys, passwords
- Insecure authentication or authorization
- Path traversal, command injection
- Insecure dependencies or imports
- OWASP Top 10 patterns

Bug checks:
- Null/undefined dereference
- Off-by-one errors
- Async/await mistakes, unhandled promises
- Memory leaks
- Incorrect error handling

Performance checks:
- N+1 queries
- Inefficient loops or algorithms
- Missing indexes implied by query patterns
- Unnecessary re-renders (React)
- Large bundle imports

Return ONLY a valid JSON array. No markdown fences. No explanation outside the JSON. If no issues found, return an empty array [].`;

router.post("/fetch-pr", async (req, res): Promise<void> => {
  const parsed = FetchPRBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { owner, repo, prNumber } = parsed.data;

  try {
    const metaResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
      { headers: githubHeaders() }
    );

    if (!metaResponse.ok) {
      const errorText = await metaResponse.text();
      req.log.warn({ status: metaResponse.status, errorText }, "GitHub API error fetching PR metadata");
      res.status(metaResponse.status).json({ error: `GitHub API error: ${metaResponse.statusText}` });
      return;
    }

    const prMeta = await metaResponse.json() as {
      title: string;
      user: { login: string };
      head: { ref: string };
      base: { ref: string };
      changed_files: number;
      additions: number;
      deletions: number;
    };

    const filesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`,
      { headers: githubHeaders() }
    );

    if (!filesResponse.ok) {
      const errorText = await filesResponse.text();
      req.log.warn({ status: filesResponse.status, errorText }, "GitHub API error fetching PR files");
      res.status(filesResponse.status).json({ error: `GitHub API error: ${filesResponse.statusText}` });
      return;
    }

    const files = await filesResponse.json() as Array<{
      filename: string;
      patch?: string;
      status: string;
      additions: number;
      deletions: number;
    }>;

    res.json({
      title: prMeta.title,
      author: prMeta.user.login,
      branch: prMeta.head.ref,
      baseBranch: prMeta.base.ref,
      filesChanged: prMeta.changed_files,
      additions: prMeta.additions,
      deletions: prMeta.deletions,
      owner,
      repo,
      prNumber,
      files: files.map((f) => ({
        filename: f.filename,
        patch: f.patch ?? null,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch PR data");
    res.status(500).json({ error: "Failed to fetch PR data from GitHub" });
  }
});

router.post("/review", async (req, res): Promise<void> => {
  const parsed = ReviewPRBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { files } = parsed.data;

  const diffContent = files
    .filter((f) => f.patch)
    .map((f) => `--- ${f.filename} ---\n${f.patch}`)
    .join("\n\n");

  if (!diffContent.trim()) {
    res.json([]);
    return;
  }

  const userMessage = `Review this PR diff:\n\n${diffContent}`;

  try {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-5",
      max_tokens: 8192,
      system: REVIEW_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        res.write(chunk.delta.text);
      }
    }

    res.end();
  } catch (err) {
    logger.error({ err }, "Claude API error during review");
    if (!res.headersSent) {
      res.status(500).json({ error: "AI review failed" });
    } else {
      res.end();
    }
  }
});

router.post("/post-comments", async (req, res): Promise<void> => {
  const parsed = PostCommentsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { owner, repo, prNumber, comments } = parsed.data;

  if (!GITHUB_TOKEN) {
    res.status(400).json({ error: "GITHUB_TOKEN is not configured" });
    return;
  }

  try {
    const body = comments
      .map(
        (c) =>
          `**[ReviewBot AI] ${c.title}**\n\n${c.issue}\n\n**Suggested fix:**\n\`\`\`\n${c.fix}\n\`\`\`\n\n${c.explanation}${c.cwe ? `\n\n> ${c.cwe}` : ""}`
      )
      .join("\n\n---\n\n");

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
      {
        method: "POST",
        headers: {
          ...githubHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body,
          event: "COMMENT",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      req.log.warn({ status: response.status, errorText }, "GitHub API error posting review");
      res.status(response.status).json({ error: `GitHub API error: ${response.statusText}` });
      return;
    }

    res.json({ success: true, posted: comments.length });
  } catch (err) {
    req.log.error({ err }, "Failed to post comments to GitHub");
    res.status(500).json({ error: "Failed to post comments to GitHub" });
  }
});

export default router;
