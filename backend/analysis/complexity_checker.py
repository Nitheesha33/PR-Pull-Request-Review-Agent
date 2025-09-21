from typing import List, Dict, Any
import radon.complexity as cc
from radon.visitors import ComplexityVisitor

from models.feedback_model import Issue
from utils.helpers import create_temp_file, cleanup_temp_files


class ComplexityChecker:
    """Checker for code complexity using Radon."""
    
    def __init__(self, threshold: str = 'C'):
        """Initialize the complexity checker with a threshold.
        
        Args:
            threshold: Complexity rank threshold (A-F, where A is the best)
        """
        self.threshold = threshold
        self.rank_to_score = {
            'A': 1,
            'B': 2,
            'C': 3,
            'D': 4,
            'E': 5,
            'F': 6
        }
    
    def check_file(self, file_content: str, file_path: str) -> List[Issue]:
        """Check a file for complexity issues using Radon.
        
        Args:
            file_content: Content of the file to check
            file_path: Path to the file (used for reporting)
            
        Returns:
            List of complexity issues found
        """
        issues = []
        
        # Only check Python files
        if not file_path.endswith('.py'):
            return issues
        
        # Parse the code with Radon
        try:
            visitor = ComplexityVisitor.from_code(file_content)
            for func in visitor.functions:
                # Get the complexity rank
                rank = cc.rank_function(func.complexity)
                
                # Check if the complexity is above the threshold
                if self.rank_to_score.get(rank, 0) >= self.rank_to_score.get(self.threshold, 0):
                    issues.append(Issue(
                        type="complexity",
                        msg=f"Function {func.name} has complexity {func.complexity} (rank {rank})",
                        line=func.lineno
                    ))
        except Exception as e:
            # Log the error and continue
            print(f"Error analyzing complexity for {file_path}: {e}")
        
        return issues
    
    def check_files(self, files_content: Dict[str, str]) -> Dict[str, List[Issue]]:
        """Check multiple files for complexity issues.
        
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
    
    def calculate_complexity_penalty(self, issues: List[Issue]) -> int:
        """Calculate a complexity penalty based on the issues found.
        
        Args:
            issues: List of complexity issues
            
        Returns:
            Complexity penalty (higher is worse)
        """
        penalty = 0
        for issue in issues:
            if issue.type == "complexity":
                # Extract the rank from the message
                try:
                    rank = issue.msg.split("rank ")[-1].strip(")")
                    penalty += self.rank_to_score.get(rank, 3) * 2
                except (IndexError, ValueError):
                    # Default penalty if we can't parse the rank
                    penalty += 6
        
        return penalty