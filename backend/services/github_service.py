import os
from typing import Dict, List, Any, Tuple

from github import Github
from github.PullRequest import PullRequest
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class GitHubService:
    """Service for interacting with GitHub API."""
    
    def __init__(self):
        """Initialize the GitHub service with token from environment variables."""
        self.token = os.getenv("GITHUB_TOKEN")
        if not self.token:
            raise ValueError("GITHUB_TOKEN environment variable not set")
        self.client = Github(self.token)
    
    def get_pull_request(self, repo_name: str, pr_number: int) -> PullRequest:
        """Get a pull request by repository name and PR number.
        
        Args:
            repo_name: Repository name in format 'username/repo'
            pr_number: Pull request number
            
        Returns:
            GitHub PullRequest object
        """
        repo = self.client.get_repo(repo_name)
        return repo.get_pull(pr_number)
    
    def get_pr_files(self, repo_name: str, pr_number: int) -> List[Dict[str, Any]]:
        """Get files changed in a pull request.
        
        Args:
            repo_name: Repository name in format 'username/repo'
            pr_number: Pull request number
            
        Returns:
            List of file data dictionaries
        """
        pr = self.get_pull_request(repo_name, pr_number)
        files = []
        
        for file in pr.get_files():
            files.append({
                "filename": file.filename,
                "status": file.status,  # 'added', 'modified', 'removed'
                "additions": file.additions,
                "deletions": file.deletions,
                "changes": file.changes,
                "patch": file.patch,
                "raw_url": file.raw_url
            })
        
        return files
    
    def get_pr_diff(self, repo_name: str, pr_number: int) -> str:
        """Get the diff content of a pull request.
        
        Args:
            repo_name: Repository name in format 'username/repo'
            pr_number: Pull request number
            
        Returns:
            Diff content as string
        """
        pr = self.get_pull_request(repo_name, pr_number)
        return pr.get_files().get_page(0)[0].patch
    
    def get_file_content(self, repo_name: str, file_path: str, ref: str) -> str:
        """Get content of a file at a specific reference.
        
        Args:
            repo_name: Repository name in format 'username/repo'
            file_path: Path to the file in the repository
            ref: Git reference (branch, commit, tag)
            
        Returns:
            File content as string
        """
        repo = self.client.get_repo(repo_name)
        content = repo.get_contents(file_path, ref=ref)
        return content.decoded_content.decode('utf-8')
    
    def get_pr_files_content(self, repo_name: str, pr_number: int) -> Dict[str, str]:
        """Get content of all files changed in a pull request.
        
        Args:
            repo_name: Repository name in format 'username/repo'
            pr_number: Pull request number
            
        Returns:
            Dictionary mapping file paths to their content
        """
        pr = self.get_pull_request(repo_name, pr_number)
        files_content = {}
        
        for file in pr.get_files():
            if file.status != 'removed':
                try:
                    content = self.get_file_content(repo_name, file.filename, pr.head.sha)
                    files_content[file.filename] = content
                except Exception as e:
                    # Log error and continue with next file
                    print(f"Error getting content for {file.filename}: {e}")
        
        return files_content