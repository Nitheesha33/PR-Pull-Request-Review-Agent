from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    """Request model for the analyze endpoint."""
    server: Optional[str] = None  # 'github', 'gitlab', or 'bitbucket'
    repo: Optional[str] = None  # 'username/repo'
    pr_number: Optional[int] = None
    pr_url: Optional[str] = None  # Full PR URL (alternative to separate repo/pr_number)
    enabled_checks: Dict[str, bool] = {}


class Issue(BaseModel):
    """Model for a single code issue."""
    type: str  # 'style', 'complexity', 'bug', 'ai-suggestion'
    msg: str = Field(alias='message')
    line: int = Field(alias='line_number')
    
    class Config:
        populate_by_name = True


class FileIssues(BaseModel):
    """Model for issues in a specific file."""
    file: str = Field(alias='file_path')
    issues: List[Issue]
    
    class Config:
        populate_by_name = True


class CategoryScore(BaseModel):
    """Model for category-specific scores."""
    style: int = 100
    performance: int = 100
    security: int = 100
    complexity: int = 100
    best_practices: int = 100
    documentation: int = 100

class Score(BaseModel):
    """Model for the overall and category scores."""
    overall: int
    categories: CategoryScore

class AnalyzeResponse(BaseModel):
    """Response model for the analyze endpoint."""
    repo: str
    pr_number: int
    server: str
    feedback: List[FileIssues]
    score: Score