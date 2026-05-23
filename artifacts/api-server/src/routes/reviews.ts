import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import {
  FetchPRBody,
  ReviewPRBody,
  PostCommentsBody,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const MAX_DIFF_CHARS = 60_000;
const MAX_FILE_PATCH_CHARS = 8_000;

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

const REVIEW_SYSTEM_PROMPT = `You are an elite code reviewer focused on security, bugs, and performance.

Analyze the PR diff and return a JSON array of issues. Each object must have EXACTLY this shape:

{
  "id": "unique-string",
  "severity": "critical" | "warning" | "suggestion",
  "category": "security" | "bug" | "performance" | "code-quality" | "best-practice",
  "file": "filename",
  "line": 1,
  "title": "Short 5-8 word title",
  "issue": "1-2 sentences describing what is wrong.",
  "fix": "corrected code snippet only — no prose",
  "explanation": "2-3 sentences on why this matters and what the fix achieves.",
  "cwe": "CWE-XXX or null"
}

Focus on real issues only. Scan for:
- Security: SQL injection, XSS, hardcoded secrets, auth flaws, OWASP Top 10 (include CWE tag)
- Bugs: null dereference, async mistakes, off-by-one, unhandled errors
- Performance: N+1 queries, unnecessary re-renders, large imports
- Code quality: missing error handling, dead code, naming issues

Return ONLY a valid JSON array. No markdown. No prose outside the JSON. Return [] if no issues found.`;

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
      req.log.warn(
        { status: metaResponse.status, errorText },
        "GitHub API error fetching PR metadata"
      );
      res
        .status(metaResponse.status)
        .json({ error: `GitHub API error: ${metaResponse.statusText}` });
      return;
    }

    const prMeta = (await metaResponse.json()) as {
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
      req.log.warn(
        { status: filesResponse.status, errorText },
        "GitHub API error fetching PR files"
      );
      res
        .status(filesResponse.status)
        .json({ error: `GitHub API error: ${filesResponse.statusText}` });
      return;
    }

    const files = (await filesResponse.json()) as Array<{
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
        patch: f.patch ? f.patch.slice(0, MAX_FILE_PATCH_CHARS) : null,
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

  req.log.info({ fileCount: files.length }, "Starting Claude review");

  let diffContent = files
    .filter((f) => f.patch)
    .map((f) => `--- ${f.filename} ---\n${f.patch}`)
    .join("\n\n");

  if (!diffContent.trim()) {
    res.json([]);
    return;
  }

  // Truncate to avoid huge prompts and slow responses
  if (diffContent.length > MAX_DIFF_CHARS) {
    diffContent =
      diffContent.slice(0, MAX_DIFF_CHARS) +
      "\n\n[diff truncated — remaining files omitted for brevity]";
    req.log.info(
      { originalLen: diffContent.length },
      "Diff truncated for review"
    );
  }

  const userMessage = `Review this PR diff:\n\n${diffContent}`;

  try {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache, no-store");
    res.setHeader("X-Accel-Buffering", "no");

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: REVIEW_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    stream.on("text", (text) => {
      res.write(text);
    });

    await stream.finalMessage();
    req.log.info("Claude review stream completed");
    res.end();
  } catch (err) {
    req.log.error({ err }, "Claude API error during review");
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
      req.log.warn(
        { status: response.status, errorText },
        "GitHub API error posting review"
      );
      res
        .status(response.status)
        .json({ error: `GitHub API error: ${response.statusText}` });
      return;
    }

    res.json({ success: true, posted: comments.length });
  } catch (err) {
    req.log.error({ err }, "Failed to post comments to GitHub");
    res.status(500).json({ error: "Failed to post comments to GitHub" });
  }
});

export default router;
