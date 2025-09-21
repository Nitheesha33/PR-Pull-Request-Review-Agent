# PR Review Agent Backend

A FastAPI backend application that fetches pull requests from GitHub (with placeholder for GitLab), analyzes code changes, and returns structured feedback.

## Features

- Fetch PR data from GitHub (GitLab support planned)
- Analyze code for style issues using Flake8
- Check cyclomatic complexity using Radon
- Detect unsafe code patterns
- Optional AI-powered code suggestions
- Calculate overall code quality score

## Project Structure

```
backend/
├── main.py                 # FastAPI entrypoint
├── services/
│   ├── github_service.py   # GitHub PR fetching
│   ├── gitlab_service.py   # Placeholder for multi-server compatibility
├── analysis/
│   ├── style_checker.py    # Runs flake8 checks
│   ├── complexity_checker.py # Radon checks
│   ├── bug_checker.py      # Detects unsafe/risky code
│   ├── ai_feedback.py      # Generates AI-based suggestions
├── models/
│   └── feedback_model.py   # Pydantic models for API response
├── utils/
│   └── helpers.py          # Shared helper functions
├── requirements.txt
└── README.md
```

## API Endpoints

### GET /health

Returns `{ "status": "ok" }`

### POST /analyze

**Request Body:**

```json
{
  "server": "github",
  "repo": "username/repo",
  "pr_number": 12
}
```

**Response Example:**

```json
{
  "repo": "username/repo",
  "pr_number": 12,
  "feedback": [
    {
      "file": "app.py",
      "issues": [
        {"type": "style", "msg": "Line too long (85 > 79 chars)", "line": 14},
        {"type": "complexity", "msg": "Function foo() too complex (C)", "line": 25},
        {"type": "ai-suggestion", "msg": "Use list comprehension for readability", "line": 40}
      ]
    }
  ],
  "score": 78
}
```

## Setup

1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Create a `.env` file with your GitHub token: `GITHUB_TOKEN=your_token_here`
4. Run the server: `uvicorn main:app --reload`

## Development

- Add new analysis modules in the `analysis/` directory
- Extend with additional Git providers by implementing new service classes in `services/`