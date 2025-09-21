import os
from typing import List, Dict, Any, Optional
import openai
from dotenv import load_dotenv

from models.feedback_model import Issue

# Load environment variables
load_dotenv()


class AIFeedbackGenerator:
    """Generator for AI-powered code suggestions using OpenAI."""
    
    def __init__(self):
        """Initialize the AI feedback generator."""
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.enabled = self.api_key is not None
        
        if self.enabled:
            openai.api_key = self.api_key
    
    def generate_feedback(self, file_content: str, file_path: str) -> List[Issue]:
        """Generate AI-powered suggestions for code improvements.
        
        Args:
            file_content: Content of the file to analyze
            file_path: Path to the file
            
        Returns:
            List of AI suggestion issues
        """
        if not self.enabled:
            return []
        
        issues = []
        
        # Only process Python files
        if not file_path.endswith('.py'):
            return issues
        
        try:
            # Split the file into chunks if it's too large
            chunks = self._split_into_chunks(file_content)
            
            for i, chunk in enumerate(chunks):
                # Calculate the starting line number for this chunk
                start_line = 1
                if i > 0:
                    start_line = file_content.count('\n', 0, file_content.find(chunk)) + 1
                
                # Generate suggestions for this chunk
                chunk_issues = self._generate_chunk_feedback(chunk, start_line)
                issues.extend(chunk_issues)
        
        except Exception as e:
            print(f"Error generating AI feedback for {file_path}: {e}")
        
        return issues
    
    def _split_into_chunks(self, content: str, max_chunk_size: int = 1000) -> List[str]:
        """Split file content into chunks for processing.
        
        Args:
            content: File content to split
            max_chunk_size: Maximum size of each chunk in characters
            
        Returns:
            List of content chunks
        """
        if len(content) <= max_chunk_size:
            return [content]
        
        lines = content.split('\n')
        chunks = []
        current_chunk = []
        current_size = 0
        
        for line in lines:
            line_size = len(line) + 1  # +1 for newline
            if current_size + line_size > max_chunk_size and current_chunk:
                chunks.append('\n'.join(current_chunk))
                current_chunk = [line]
                current_size = line_size
            else:
                current_chunk.append(line)
                current_size += line_size
        
        if current_chunk:
            chunks.append('\n'.join(current_chunk))
        
        return chunks
    
    def _generate_chunk_feedback(self, code_chunk: str, start_line: int) -> List[Issue]:
        """Generate feedback for a chunk of code using OpenAI.
        
        Args:
            code_chunk: Chunk of code to analyze
            start_line: Starting line number of this chunk in the original file
            
        Returns:
            List of AI suggestion issues
        """
        issues = []
        
        try:
            # Prepare the prompt for OpenAI
            prompt = f"""Analyze this Python code and suggest improvements for readability, 
            performance, and best practices. Focus on concrete, actionable suggestions. 
            Format each suggestion as a separate line starting with 'SUGGESTION: '.
            
            ```python
            {code_chunk}
            ```
            """
            
            # Call OpenAI API
            response = openai.Completion.create(
                engine="text-davinci-003",  # or use a more recent model
                prompt=prompt,
                max_tokens=500,
                temperature=0.3,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0
            )
            
            # Parse the suggestions
            suggestions = []
            for line in response.choices[0].text.strip().split('\n'):
                if line.startswith('SUGGESTION:'):
                    suggestions.append(line[11:].strip())  # Remove 'SUGGESTION: ' prefix
            
            # Map suggestions to line numbers (simplified approach)
            lines = code_chunk.split('\n')
            for i, suggestion in enumerate(suggestions):
                # Distribute suggestions across the chunk
                # This is a simplified approach; in a real implementation,
                # you would want to map suggestions to the specific lines they refer to
                line_number = start_line + min(i, len(lines) - 1)
                
                issues.append(Issue(
                    type="ai-suggestion",
                    msg=suggestion,
                    line=line_number
                ))
        
        except Exception as e:
            print(f"Error calling OpenAI API: {e}")
        
        return issues
    
    def generate_feedback_for_files(self, files_content: Dict[str, str]) -> Dict[str, List[Issue]]:
        """Generate AI feedback for multiple files.
        
        Args:
            files_content: Dictionary mapping file paths to their content
            
        Returns:
            Dictionary mapping file paths to lists of AI suggestion issues
        """
        if not self.enabled:
            return {file_path: [] for file_path in files_content}
        
        results = {}
        
        for file_path, content in files_content.items():
            # Only process Python files
            if file_path.endswith('.py'):
                results[file_path] = self.generate_feedback(content, file_path)
            else:
                results[file_path] = []
        
        return results