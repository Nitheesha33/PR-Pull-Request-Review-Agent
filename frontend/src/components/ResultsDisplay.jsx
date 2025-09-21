import React from 'react';

const ResultsDisplay = ({ results }) => {
  if (!results) return null;

  const { score, feedback, repo, pr_number, server } = results;
  
  // Extract overall score from score object
  const overallScore = typeof score === 'object' ? score?.overall : score || 0;
  
  // Calculate total issues
  const totalIssues = feedback.reduce((total, file) => total + file.issues.length, 0);
  
  // Group issues by type
  const issuesByType = feedback.reduce((types, file) => {
    file.issues.forEach(issue => {
      types[issue.type] = (types[issue.type] || 0) + 1;
    });
    return types;
  }, {});

  // Get color based on score
  const getScoreColor = (value) => {
    if (value >= 80) return 'text-green-500';
    if (value >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">PR Review Results</h2>
            <p className="text-gray-600">
              Repository: <span className="font-medium">{repo}</span> | PR #{pr_number}
            </p>
          </div>
          <div className="mt-4 md:mt-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg p-4 text-white text-center">
            <p className="text-sm uppercase font-semibold">Overall Score</p>
            <p className="text-4xl font-bold">{overallScore}/100</p>
          </div>
        </div>
      </div>

      {/* Score Overview */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">Score Breakdown</h3>
        <p className="text-gray-600 mb-4">
          This PR has a total of <span className="font-bold">{totalIssues}</span> issues identified.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(issuesByType).map(([type, count]) => (
            <div key={type} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-800 mb-2">
                {type.toUpperCase()}
              </span>
              <p className="text-lg font-bold">{count} issues</p>
            </div>
          ))}
        </div>
      </div>

      {/* Issues Summary */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Issues Summary</h3>
        
        {feedback.length === 0 ? (
          <p className="text-gray-600">No issues found in this PR. Great job!</p>
        ) : (
          <div className="space-y-4">
            {feedback.map((file, fileIndex) => (
              <div key={fileIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-3 border-b border-gray-200">
                  <h4 className="font-medium text-gray-800">{file.file_path || file.file}</h4>
                </div>
                
                {file.issues.length === 0 ? (
                  <p className="p-3 text-gray-600">No issues found in this file.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {file.issues.map((issue, issueIndex) => {
                      // Determine color based on issue type
                      let typeColor = 'bg-blue-100 text-blue-800';
                      if (issue.type === 'error') typeColor = 'bg-red-100 text-red-800';
                      if (issue.type === 'warning') typeColor = 'bg-yellow-100 text-yellow-800';
                      if (issue.type === 'info') typeColor = 'bg-green-100 text-green-800';
                      
                      return (
                        <li key={issueIndex} className="p-3">
                          <div className="flex items-start">
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${typeColor} mr-2`}>
                              {issue.type.toUpperCase()}
                            </span>
                            <div>
                              <p className="text-gray-800">{issue.msg || issue.message}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Line: {issue.line || issue.line_number}
                              </p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Server Info */}
      <div className="text-sm text-gray-500 mt-8 text-right">
        Processed by server: {server}
      </div>
    </div>
  );
};

export default ResultsDisplay;