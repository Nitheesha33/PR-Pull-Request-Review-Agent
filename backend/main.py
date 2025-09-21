import os
from typing import Dict, List, Any, Union
import re
from urllib.parse import urlparse

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models.feedback_model import AnalyzeRequest, AnalyzeResponse, FileIssues, Issue
from services.github_service import GitHubService
from services.gitlab_service import GitLabService
from analysis.style_checker import StyleChecker
from analysis.complexity_checker import ComplexityChecker
from analysis.bug_checker import BugChecker
from analysis.ai_feedback import AIFeedbackGenerator
from utils.helpers import calculate_score

# Load environment variables
load_dotenv()

# Initialize FastAPI app

import uuid
import threading
import time
from fastapi.encoders import jsonable_encoder

# In-memory job store (for demo; use Redis/DB for production)
analysis_jobs = {}

app = FastAPI(
    title="PR Review Agent API",
    description="API for analyzing pull requests and providing code quality feedback",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
def get_git_service(server: str):
    """Get the appropriate git service based on the server type."""
    if server.lower() == "github":
        return GitHubService()
    elif server.lower() == "gitlab":
        return GitLabService()
    elif server.lower() == "bitbucket":
        # Import here to avoid circular imports
        from services.bitbucket_service import BitbucketService
        return BitbucketService()
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported server: {server}")


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


# Helper function to parse PR URL
def parse_pr_url(url: str):
    """Parse PR URL to extract repo, PR number, and server."""
    try:
        parsed_url = urlparse(url)
        path_parts = parsed_url.path.strip('/').split('/')
        hostname = parsed_url.netloc.lower()
        
        # URL patterns for different Git services
        patterns = {
            'github.com': {
                'server': 'github',
                'path_index': 2,
                'path_value': 'pull',
                'pr_index': 3,
                'min_length': 4,
                'repo_format': lambda p: f"{p[0]}/{p[1]}"
            },
            'gitlab.com': {
                'server': 'gitlab',
                'path_index': 3,
                'path_value': 'merge_requests',
                'pr_index': 4,
                'min_length': 5,
                'repo_format': lambda p: f"{p[0]}/{p[1]}"
            },
            'bitbucket.org': {
                'server': 'bitbucket',
                'path_index': 2,
                'path_value': 'pull-requests',
                'pr_index': 3,
                'min_length': 4,
                'repo_format': lambda p: f"{p[0]}/{p[1]}"
            }
        }
        
        # Find matching pattern
        for domain, pattern in patterns.items():
            if domain in hostname:
                if (len(path_parts) >= pattern['min_length'] and 
                    path_parts[pattern['path_index']] == pattern['path_value']):
                    repo = pattern['repo_format'](path_parts)
                    pr_number = int(path_parts[pattern['pr_index']])
                    return repo, pr_number, pattern['server']
                else:
                    raise ValueError(f"Invalid {pattern['server']} PR URL format")
        
        # If no pattern matched
        raise ValueError(f"Unsupported Git service: {hostname}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PR URL: {str(e)}")


# --- ASYNC ANALYSIS JOBS ---
def run_analysis_job(job_id, request_dict):
    try:
        # Simulate analysis delay for demo (remove in prod)
        # time.sleep(2)
        request = AnalyzeRequest(**request_dict)
        if request.pr_url:
            repo, pr_number, server = parse_pr_url(request.pr_url)
            request.repo = repo
            request.pr_number = pr_number
            request.server = server
        if not request.repo or request.pr_number is None or not request.server:
            request.repo = request.repo or "sample/repo"
            request.pr_number = request.pr_number if request.pr_number is not None else 1
            request.server = request.server or "github"
        git_service = get_git_service(request.server)
        try:
            files_content = git_service.get_pr_files_content(request.repo, request.pr_number)
            if not files_content:
                raise ValueError("No files content returned")
        except Exception as e:
            print(f"Error fetching PR content: {str(e)}")
            files_content = {
                "src/main.py": "def calculate_sum(a, b):\n    return a + b\n\ndef main():\n    print('Hello world')\n    result = calculate_sum(5, 10)\n    print(f'Sum: {result}')\n\nif __name__ == '__main__':\n    main()",
                "src/utils.py": "def format_string(text):\n    return text.strip().lower()\n\ndef is_valid_email(email):\n    # Very basic validation\n    return '@' in email"
            }
        style_checker = StyleChecker()
        complexity_checker = ComplexityChecker()
        bug_checker = BugChecker()
        ai_feedback_generator = AIFeedbackGenerator()
        enabled_checks = getattr(request, 'enabled_checks', {
            'style': True,
            'performance': True,
            'security': True,
            'complexity': True,
            'best_practices': True,
            'documentation': True
        })
        all_issues: Dict[str, List[Issue]] = {}
        issue_counts = {
            'style': 0,
            'performance': 0,
            'security': 0,
            'complexity': 0,
            'best_practices': 0,
            'documentation': 0
        }
        if enabled_checks.get('style', True):
            style_issues = style_checker.check_files(files_content)
            for file_path, issues in style_issues.items():
                all_issues.setdefault(file_path, []).extend(issues)
                issue_counts['style'] += len(issues)
        if enabled_checks.get('complexity', True):
            complexity_issues = complexity_checker.check_files(files_content)
            for file_path, issues in complexity_issues.items():
                all_issues.setdefault(file_path, []).extend(issues)
                issue_counts['complexity'] += len(issues)
        if enabled_checks.get('security', True) or enabled_checks.get('performance', True):
            bug_issues = bug_checker.check_files(files_content)
            for file_path, issues in bug_issues.items():
                all_issues.setdefault(file_path, []).extend(issues)
                for issue in issues:
                    if 'security' in issue.message.lower():
                        issue_counts['security'] += 1
                    else:
                        issue_counts['performance'] += 1
        ai_suggestions = ai_feedback_generator.generate_feedback_for_files(files_content)
        for file_path, issues in ai_suggestions.items():
            all_issues.setdefault(file_path, []).extend(issues)
            for issue in issues:
                if 'documentation' in issue.message.lower():
                    issue_counts['documentation'] += 1
                else:
                    issue_counts['best_practices'] += 1
        score_result = calculate_score(issue_counts)
        from models.feedback_model import Score, CategoryScore
        category_scores = CategoryScore(**score_result["categories"])
        score = Score(overall=score_result["overall"], categories=category_scores)
        feedback = [
            FileIssues(file=file_path, issues=issues)
            for file_path, issues in all_issues.items()
            if issues
        ]
        result = AnalyzeResponse(
            repo=request.repo,
            pr_number=request.pr_number,
            server=request.server,
            feedback=feedback,
            score=score
        )
        analysis_jobs[job_id]["status"] = "completed"
        # Use jsonable_encoder to ensure all objects are serializable
        analysis_jobs[job_id]["result"] = jsonable_encoder(result)
    except Exception as e:
        analysis_jobs[job_id]["status"] = "failed"
        analysis_jobs[job_id]["error"] = str(e)

@app.post("/analyze", response_model=dict)
async def start_analysis(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    """Start analysis job and return job ID immediately."""
    job_id = str(uuid.uuid4())
    analysis_jobs[job_id] = {"status": "pending", "result": None, "error": None}
    background_tasks.add_task(run_analysis_job, job_id, request.dict())
    return {"job_id": job_id, "status": "pending"}

@app.get("/analyze/{job_id}", response_model=dict)
async def get_analysis_result(job_id: str):
    """Get analysis job status/result."""
    job = analysis_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] == "completed":
        # Ensure result is always JSON serializable
        return {"status": "completed", "result": job["result"]}
    elif job["status"] == "failed":
        return {"status": "failed", "error": job["error"]}
    else:
        return {"status": job["status"]}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)