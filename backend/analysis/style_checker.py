import subprocess
import tempfile
from typing import List, Dict, Any

from models.feedback_model import Issue
from utils.helpers import create_temp_file, cleanup_temp_files


class StyleChecker:
    """Checker for code style issues using Flake8."""
    
    def check_file(self, file_content: str, file_path: str) -> List[Issue]:
        """Check a file for style issues using Flake8.
        
        Args:
            file_content: Content of the file to check
            file_path: Path to the file (used for reporting)
            
        Returns:
            List of style issues found
        """
        # Create a temporary file with the content
        temp_file = create_temp_file(file_content)
        issues = []
        
        try:
            # Run flake8 on the temporary file
            result = subprocess.run(
                ['flake8', '--format=%(row)d:%(col)d:%(code)s:%(text)s', temp_file],
                capture_output=True,
                text=True,
                check=False
            )
            
            # Parse the output
            for line in result.stdout.strip().split('\n'):
                if not line:
                    continue
                    
                try:
                    # Parse the line in format: line:column:code:message
                    parts = line.split(':', 3)
                    if len(parts) < 4:
                        continue
                        
                    line_num = int(parts[0])
                    code = parts[2]
                    message = parts[3].strip()
                    
                    issues.append(Issue(
                        type="style",
                        msg=f"{code}: {message}",
                        line=line_num
                    ))
                except (ValueError, IndexError) as e:
                    # Skip lines that can't be parsed
                    print(f"Error parsing flake8 output: {e}")
        finally:
            # Clean up the temporary file
            cleanup_temp_files([temp_file])
        
        return issues
    
    def check_files(self, files_content: Dict[str, str]) -> Dict[str, List[Issue]]:
        """Check multiple files for style issues.
        
        Args:
            files_content: Dictionary mapping file paths to their content
            
        Returns:
            Dictionary mapping file paths to lists of issues
        """
        results = {}
        
        for file_path, content in files_content.items():
            # Only check Python files
            if file_path.endswith('.py'):
                results[file_path] = self.check_file(content, file_path)
            else:
                results[file_path] = []
        
        return results