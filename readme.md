# ReviewBot AI — Intelligent Code Review Assistant

> **AI-powered code reviews that catch bugs, security vulnerabilities, and performance issues before they hit production.**

![ReviewBot AI](https://img.shields.io/badge/ReviewBot-AI-green?style=for-the-badge&logo=github)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Claude AI](https://img.shields.io/badge/Claude-Anthropic-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## The Problem

Manual code reviews are slow, inconsistent, and miss critical issues. Engineering teams spend hours reviewing pull requests while security vulnerabilities, performance bottlenecks, and subtle bugs slip through unnoticed — costing time, money, and trust.

---

## The Solution

**ReviewBot AI** connects directly to GitHub, analyzes pull request diffs in real-time using Claude AI, and delivers a comprehensive code review in under 60 seconds — complete with severity scores, CWE-classified security findings, and corrected code snippets ready to post back to your PR.

---

## Features

### Security Scanning
- Detects OWASP Top 10 vulnerabilities
- Identifies hardcoded secrets, API keys, and passwords
- Flags SQL injection, XSS, and path traversal risks
- CWE classification on every security finding

### Bug Detection
- Null/undefined dereferences
- Unhandled promises and async errors
- Off-by-one errors and logic flaws
- Typos in function/variable names that cause runtime crashes

### Performance Analysis
- N+1 database query detection
- Inefficient loop and algorithm identification
- Synchronous I/O blocking the event loop
- Unnecessary re-renders in React components

### Auto-Fix Suggestions
- Corrected code snippet for every issue found
- Not just warnings — actual working fixes
- One-click copy to clipboard

### GitHub Integration
- Paste any GitHub PR URL to start a review
- One-click post of all comments directly to the PR
- Review comments appear inline on the actual pull request

### Review Scoring
- 0–100 score based on issue severity
- Critical issues weighted heavily
- Instant visual feedback for engineers and reviewers

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| AI Engine | Anthropic Claude (claude-sonnet-4-20250514) |
| Authentication | NextAuth.js + Google OAuth |
| GitHub Integration | GitHub REST API v3 |
| Animations | Framer Motion, GSAP |
| UI Style | Liquid Glass Dark Theme |
| Deployment | Replit |

---

## How It Works

```
User pastes GitHub PR URL
        ↓
ReviewBot fetches PR diff via GitHub API
        ↓
Diff sent to Claude AI with expert security + bug detection prompt
        ↓
Claude returns structured JSON with issues, severity, CWE tags, and fixes
        ↓
ReviewBot displays findings with score, badges, and code suggestions
        ↓
User clicks "Post All to GitHub" → comments appear on the actual PR
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Anthropic API key
- GitHub Personal Access Token
- Google OAuth credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/raghuvarshan452-commits/reviewbot-demo.git

# Navigate to project directory
cd reviewbot-demo

# Install dependencies
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

1. Sign in with your Google account
2. Copy any GitHub Pull Request URL
3. Paste it into the ReviewBot search bar
4. Press Enter and watch the AI review stream in real-time
5. Browse issues filtered by severity — Critical, Warning, Suggestion
6. Click **"Post All to GitHub"** to push comments to the actual PR

---

## Example Output

Testing on a real Express.js PR (`expressjs/express #3390`):

| Finding | Severity | Category | CWE |
|---|---|---|---|
| Hardcoded RSA private key committed to repo | CRITICAL | Security | CWE-798 |
| Hardcoded TLS certificate in repository | CRITICAL | Security | CWE-798 |
| Typo in function name causes runtime crash | CRITICAL | Bug | — |
| Unsafe path check vulnerable to traversal | WARNING | Security | CWE-22 |
| Unhandled error in push callback | WARNING | Bug | — |
| Synchronous file read blocks event loop | WARNING | Performance | — |

**Review Score: 0/100** — Even production codebases from major frameworks aren't safe.

---

## Project Structure

```
reviewbot-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth Google OAuth
│   │   │   ├── fetch-pr/      # GitHub PR diff fetcher
│   │   │   ├── review/        # Claude AI review engine
│   │   │   └── post-comment/  # GitHub comment poster
│   │   ├── login/             # Liquid glass login page
│   │   ├── dashboard/         # Main dashboard
│   │   └── review/            # Review detail view
│   ├── components/            # Reusable UI components
│   └── index.css              # Liquid glass design system
├── .env.local                 # Environment variables
├── tailwind.config.js
└── package.json
```

---

## AI Prompt Engineering

The core of ReviewBot is a carefully engineered system prompt that instructs Claude to act as an elite code reviewer:

- Scans for OWASP Top 10 security patterns
- Returns structured JSON with severity, category, CWE, issue, fix, and explanation
- Generates actual corrected code — not vague descriptions
- Prioritizes critical security issues above all else

---

## Bonus Features Implemented

- Real-world usability — works on any public GitHub PR
- Premium UI/UX — liquid glass dark theme with video background
- Full AI integration — Claude streaming with structured output
- Google OAuth authentication
- localStorage review history
- Export review as Markdown report
- Review score with count-up animation
- Staggered card animations

---

## Built At

**Agentic AI Hackathon** — May 23–24, 2026

**Team:** Neural Ninjas

**Problem Statement:** #1 — AI-Powered Code Review Assistant for Engineering Teams

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with Claude AI + Next.js + GitHub API**

*Catch bugs before your users do.*

</div>