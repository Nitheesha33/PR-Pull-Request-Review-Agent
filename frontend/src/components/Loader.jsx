import React from 'react';

const Loader = ({ message = "Analyzing your pull request..." }) => {
  return (
    <div className="bg-skycast-beige rounded-lg shadow-xl p-8 max-w-md mx-auto">
      <div className="text-center">
        {/* Spinner */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-skycast-lightBlue border-t-skycast-blue rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-skycast-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading Message */}
        <h3 className="text-lg font-semibold text-skycast-blue mb-2">
          {message}
        </h3>
        
        {/* Progress Steps */}
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Fetching PR data</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span>Analyzing code quality</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Generating feedback</span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          This may take a few moments depending on the PR size...
        </div>
      </div>
    </div>
  );
};

export default Loader;
