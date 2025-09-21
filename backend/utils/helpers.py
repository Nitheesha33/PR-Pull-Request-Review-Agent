import os
import tempfile
from typing import Dict, List, Any, Tuple


def create_temp_file(content: str, suffix: str = '.py') -> str:
    """Create a temporary file with the given content.
    
    Args:
        content: The content to write to the file
        suffix: The file extension
        
    Returns:
        The path to the temporary file
    """
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    temp_file.write(content.encode('utf-8'))
    temp_file.close()
    return temp_file.name


def cleanup_temp_files(file_paths: List[str]) -> None:
    """Delete temporary files.
    
    Args:
        file_paths: List of file paths to delete
    """
    for file_path in file_paths:
        try:
            os.remove(file_path)
        except (OSError, FileNotFoundError):
            pass


def calculate_score(issues: Dict[str, int], weights: Dict[str, float] = None) -> Dict[str, Any]:
    """Calculate code quality score based on different types of issues.
    
    Args:
        issues: Dictionary with counts of different issue types
            (style, performance, security, complexity, best_practices, documentation)
        weights: Optional dictionary with weights for each issue type
            
    Returns:
        Dictionary with overall score and category scores
    """
    # Default weights if not provided
    if weights is None:
        weights = {
            "style": 0.15,
            "performance": 0.2,
            "security": 0.25,
            "complexity": 0.15,
            "best_practices": 0.15,
            "documentation": 0.1
        }
    
    # Calculate category scores
    category_scores = {}
    for category, count in issues.items():
        # Higher counts mean lower scores
        penalty = min(count * 2, 100)  # Cap penalty at 100
        category_scores[category] = max(0, 100 - penalty)
    
    # Calculate weighted overall score
    overall_score = 0
    for category, score in category_scores.items():
        if category in weights:
            overall_score += score * weights[category]
    
    # Round to nearest integer
    overall_score = round(overall_score)
    
    return {
        "overall": overall_score,
        "categories": category_scores
    }


def parse_diff_to_content(diff_content: str) -> Dict[str, str]:
    """Parse git diff content to extract file contents.
    
    Args:
        diff_content: Git diff content
        
    Returns:
        Dictionary mapping file paths to their content
    """
    # This is a simplified implementation
    # A real implementation would properly parse the git diff format
    files_content = {}
    current_file = None
    current_content = []
    
    for line in diff_content.split('\n'):
        if line.startswith('+++ b/'):
            if current_file and current_content:
                files_content[current_file] = '\n'.join(current_content)
            current_file = line[6:]  # Remove '+++ b/' prefix
            current_content = []
        elif line.startswith('+') and current_file and not line.startswith('+++'):
            # Add only added lines (remove the '+' prefix)
            current_content.append(line[1:])
    
    if current_file and current_content:
        files_content[current_file] = '\n'.join(current_content)
    
    return files_content