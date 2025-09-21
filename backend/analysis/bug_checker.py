import ast
import re
from typing import List, Dict, Any, Set

from models.feedback_model import Issue


class BugChecker:
    """Checker for potential bugs and unsafe code patterns."""
    
    def __init__(self):
        """Initialize the bug checker with patterns to detect."""
        # Patterns to look for in the code
        self.unsafe_functions = {
            'eval': 'Use of eval() is potentially dangerous',
            'exec': 'Use of exec() is potentially dangerous',
            '__import__': 'Dynamic imports can be risky',
            'pickle.loads': 'Unpickling data from untrusted sources is unsafe',
            'marshal.loads': 'Loading marshal data can be unsafe',
            'subprocess.call': 'Check for command injection in subprocess calls',
            'os.system': 'Check for command injection in os.system calls',
            'os.popen': 'Check for command injection in os.popen calls'
        }
    
    def check_file(self, file_content: str, file_path: str) -> List[Issue]:
        """Check a file for potential bugs and unsafe patterns.
        
        Args:
            file_content: Content of the file to check
            file_path: Path to the file (used for reporting)
            
        Returns:
            List of bug issues found
        """
        issues = []
        
        # Only check Python files
        if not file_path.endswith('.py'):
            return issues
        
        try:
            # Parse the code into an AST
            tree = ast.parse(file_content)
            
            # Check for unsafe function calls
            issues.extend(self._check_unsafe_functions(tree, file_content))
            
            # Check for unused imports
            issues.extend(self._check_unused_imports(tree, file_content))
            
            # Check for hardcoded credentials
            issues.extend(self._check_hardcoded_credentials(file_content))
            
        except SyntaxError as e:
            # Report syntax errors
            issues.append(Issue(
                type="bug",
                msg=f"Syntax error: {str(e)}",
                line=e.lineno or 1
            ))
        except Exception as e:
            # Log other errors and continue
            print(f"Error analyzing {file_path} for bugs: {e}")
        
        return issues
    
    def _check_unsafe_functions(self, tree: ast.AST, file_content: str) -> List[Issue]:
        """Check for calls to unsafe functions.
        
        Args:
            tree: AST of the file
            file_content: Content of the file
            
        Returns:
            List of issues related to unsafe function calls
        """
        issues = []
        
        class UnsafeFunctionVisitor(ast.NodeVisitor):
            def __init__(self, checker):
                self.issues = []
                self.checker = checker
            
            def visit_Call(self, node):
                # Check for direct function calls
                if isinstance(node.func, ast.Name) and node.func.id in self.checker.unsafe_functions:
                    self.issues.append(Issue(
                        type="bug",
                        msg=self.checker.unsafe_functions[node.func.id],
                        line=node.lineno
                    ))
                # Check for attribute calls (like module.function)
                elif isinstance(node.func, ast.Attribute) and isinstance(node.func.value, ast.Name):
                    full_name = f"{node.func.value.id}.{node.func.attr}"
                    if full_name in self.checker.unsafe_functions:
                        self.issues.append(Issue(
                            type="bug",
                            msg=self.checker.unsafe_functions[full_name],
                            line=node.lineno
                        ))
                
                # Continue visiting child nodes
                self.generic_visit(node)
        
        visitor = UnsafeFunctionVisitor(self)
        visitor.visit(tree)
        issues.extend(visitor.issues)
        
        return issues
    
    def _check_unused_imports(self, tree: ast.AST, file_content: str) -> List[Issue]:
        """Check for unused imports.
        
        Args:
            tree: AST of the file
            file_content: Content of the file
            
        Returns:
            List of issues related to unused imports
        """
        issues = []
        
        # Collect all imported names
        imported_names = set()
        # Collect all used names
        used_names = set()
        
        class ImportVisitor(ast.NodeVisitor):
            def visit_Import(self, node):
                for name in node.names:
                    imported_names.add(name.name.split('.')[0])
                self.generic_visit(node)
            
            def visit_ImportFrom(self, node):
                if node.module:
                    for name in node.names:
                        if name.name != '*':
                            imported_names.add(name.name)
                self.generic_visit(node)
        
        class NameVisitor(ast.NodeVisitor):
            def visit_Name(self, node):
                if isinstance(node.ctx, ast.Load):
                    used_names.add(node.id)
                self.generic_visit(node)
            
            def visit_Attribute(self, node):
                if isinstance(node.value, ast.Name):
                    used_names.add(node.value.id)
                self.generic_visit(node)
        
        import_visitor = ImportVisitor()
        import_visitor.visit(tree)
        
        name_visitor = NameVisitor()
        name_visitor.visit(tree)
        
        # Find unused imports
        unused_imports = imported_names - used_names
        
        # Create issues for unused imports
        for name in unused_imports:
            # Find the line number of the import
            for node in ast.walk(tree):
                if isinstance(node, (ast.Import, ast.ImportFrom)):
                    for import_name in node.names:
                        if import_name.name == name or import_name.name.split('.')[0] == name:
                            issues.append(Issue(
                                type="bug",
                                msg=f"Unused import: {name}",
                                line=node.lineno
                            ))
        
        return issues
    
    def _check_hardcoded_credentials(self, file_content: str) -> List[Issue]:
        """Check for hardcoded credentials.
        
        Args:
            file_content: Content of the file
            
        Returns:
            List of issues related to hardcoded credentials
        """
        issues = []
        
        # Patterns for potential hardcoded credentials
        patterns = [
            (r'password\s*=\s*["\']\w+["\']', 'Hardcoded password'),
            (r'api_key\s*=\s*["\']\w+["\']', 'Hardcoded API key'),
            (r'secret\s*=\s*["\']\w+["\']', 'Hardcoded secret'),
            (r'token\s*=\s*["\']\w+["\']', 'Hardcoded token')
        ]
        
        for pattern, message in patterns:
            for match in re.finditer(pattern, file_content, re.IGNORECASE):
                # Calculate line number
                line_number = file_content[:match.start()].count('\n') + 1
                issues.append(Issue(
                    type="bug",
                    msg=message,
                    line=line_number
                ))
        
        return issues
    
    def check_files(self, files_content: Dict[str, str]) -> Dict[str, List[Issue]]:
        """Check multiple files for potential bugs.
        
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