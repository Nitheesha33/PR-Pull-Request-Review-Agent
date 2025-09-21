import React, { useState } from 'react';

const FeedbackList = ({ feedback }) => {
  const [expandedFiles, setExpandedFiles] = useState(new Set());
  const [filterType, setFilterType] = useState('all');

  const toggleFile = (filePath) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(filePath)) {
      newExpanded.delete(filePath);
    } else {
      newExpanded.add(filePath);
    }
    setExpandedFiles(newExpanded);
  };

  const getIssueTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'style':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'complexity':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'bug':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'ai-suggestion':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getIssueTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'style':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
        );
      case 'complexity':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'bug':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'ai-suggestion':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const filteredFeedback = feedback.filter(fileIssues => {
    if (filterType === 'all') return true;
    return fileIssues.issues.some(issue => issue.type.toLowerCase() === filterType);
  });

  const getTotalIssuesByType = () => {
    const counts = { all: 0, style: 0, complexity: 0, bug: 0, 'ai-suggestion': 0 };
    
    feedback.forEach(fileIssues => {
      fileIssues.issues.forEach(issue => {
        counts.all++;
        counts[issue.type.toLowerCase()] = (counts[issue.type.toLowerCase()] || 0) + 1;
      });
    });
    
    return counts;
  };

  const issueCounts = getTotalIssuesByType();

  if (!feedback || feedback.length === 0) {
    return (
      <div className="bg-skycast-beige rounded-lg shadow-lg p-8 text-center">
        <div className="text-green-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-skycast-blue mb-2">
          No Issues Found!
        </h3>
        <p className="text-gray-600">
          Great job! Your code looks clean and follows best practices.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="bg-skycast-beige rounded-lg shadow-lg p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Issues', count: issueCounts.all },
            { key: 'style', label: 'Style', count: issueCounts.style },
            { key: 'complexity', label: 'Complexity', count: issueCounts.complexity },
            { key: 'bug', label: 'Bugs', count: issueCounts.bug },
            { key: 'ai-suggestion', label: 'AI Suggestions', count: issueCounts['ai-suggestion'] }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === key
                  ? 'bg-skycast-blue text-white'
                  : 'bg-skycast-lightBlue text-gray-700 hover:bg-opacity-80'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Files List */}
      <div className="space-y-4">
        {filteredFeedback.map((fileIssues) => (
          <div key={fileIssues.file} className="bg-skycast-beige rounded-lg shadow-lg overflow-hidden">
            {/* File Header */}
            <div
              className="p-4 cursor-pointer hover:bg-skycast-lightBlue transition-colors"
              onClick={() => toggleFile(fileIssues.file)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-mono text-sm text-gray-900 dark:text-white">
                    {fileIssues.file_path || fileIssues.file}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                    {fileIssues.issues.length} issue{fileIssues.issues.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedFiles.has(fileIssues.file) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Issues List */}
            {expandedFiles.has(fileIssues.file) && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                {fileIssues.issues
                  .filter(issue => filterType === 'all' || issue.type.toLowerCase() === filterType)
                  .map((issue, index) => (
                    <div
                      key={index}
                      className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getIssueTypeColor(issue.type)}`}>
                          {getIssueTypeIcon(issue.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getIssueTypeColor(issue.type)}`}>
                              {issue.type.charAt(0).toUpperCase() + issue.type.slice(1)}
                            </span>
                            {(issue.line || issue.line_number) && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Line {issue.line || issue.line_number}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {issue.msg || issue.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-skycast-beige rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-skycast-blue mb-4">
          Analysis Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { type: 'style', label: 'Style Issues', count: issueCounts.style },
            { type: 'complexity', label: 'Complexity', count: issueCounts.complexity },
            { type: 'bug', label: 'Bugs', count: issueCounts.bug },
            { type: 'ai-suggestion', label: 'AI Suggestions', count: issueCounts['ai-suggestion'] }
          ].map(({ type, label, count }) => (
            <div key={type} className="text-center p-3 bg-skycast-lightBlue rounded-lg">
              <div className={`text-2xl font-bold ${getIssueTypeColor(type).split(' ')[1]}`}>
                {count}
              </div>
              <div className="text-sm text-gray-600">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedbackList;
