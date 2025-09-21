import os
import requests
from typing import Dict, List, Any, Optional

class BitbucketService:
    """Service for interacting with Bitbucket API."""
    
    def __init__(self):
        self.base_url = "https://api.bitbucket.org/2.0"
        self.token = os.getenv("BITBUCKET_TOKEN", "")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def get_pull_request(self, repo: str, pr_number: int) -> Dict[str, Any]:
        """Get pull request details from Bitbucket."""
        url = f"{self.base_url}/repositories/{repo}/pullrequests/{pr_number}"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code != 200:
            raise Exception(f"Failed to get PR details: {response.status_code} - {response.text}")
        
        return response.json()
    
    def get_pull_request_files(self, repo: str, pr_number: int) -> List[Dict[str, Any]]:
        """Get files changed in a pull request."""
        url = f"{self.base_url}/repositories/{repo}/pullrequests/{pr_number}/diffstat"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code != 200:
            raise Exception(f"Failed to get PR files: {response.status_code} - {response.text}")
        
        files = []
        for file_entry in response.json().get("values", []):
            files.append({
                "filename": file_entry.get("new", {}).get("path", ""),
                "status": self._map_status(file_entry.get("status", "")),
                "additions": file_entry.get("lines_added", 0),
                "deletions": file_entry.get("lines_removed", 0),
                "changes": file_entry.get("lines_added", 0) + file_entry.get("lines_removed", 0)
            })
        
        return files
    
    def get_file_content(self, repo: str, file_path: str, ref: str) -> Optional[str]:
        """Get file content from Bitbucket."""
        url = f"{self.base_url}/repositories/{repo}/src/{ref}/{file_path}"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code != 200:
            return None
        
        return response.text
    
    def _map_status(self, status: str) -> str:
        """Map Bitbucket file status to standardized status."""
        status_map = {
            "added": "added",
            "removed": "removed",
            "modified": "modified",
            "renamed": "renamed"
        }
        return status_map.get(status, "modified")