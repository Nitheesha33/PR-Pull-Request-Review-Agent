import React, { useState, useEffect } from 'react';

const InputForm = ({ onAnalyze, loading, serverStatus }) => {
  const [formData, setFormData] = useState({
    prUrl: '',
    server: 'github',
    enabledChecks: {
      style: true,
      complexity: true,
      security: true,
      performance: true,
      ai_feedback: true
    }
  });
  const [errors, setErrors] = useState({});
  const [animateButton, setAnimateButton] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Validate PR URL
    if (!formData.prUrl.trim()) {
      newErrors.prUrl = 'Pull Request URL is required';
    } else {
      const url = formData.prUrl.trim();
      const githubPattern = /^https?:\/\/github\.com\/[^\/]+\/[^\/]+\/pull\/\d+\/?.*$/;
      const gitlabPattern = /^https?:\/\/gitlab\.com\/[^\/]+\/[^\/]+\/-\/merge_requests\/\d+\/?.*$/;
      const bitbucketPattern = /^https?:\/\/bitbucket\.org\/[^\/]+\/[^\/]+\/pull-requests\/\d+\/?.*$/;
      
      if (!(githubPattern.test(url) || gitlabPattern.test(url) || bitbucketPattern.test(url))) {
        newErrors.prUrl = 'Please enter a valid Pull Request URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Extract repository and PR number from URL
  const extractInfoFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(part => part);
      
      // URL patterns for different Git services
      const patterns = {
        'github.com': {
          server: 'github',
          pathIndex: 2,
          pathValue: 'pull',
          prIndex: 3,
          repoFormat: (parts) => `${parts[0]}/${parts[1]}`
        },
        'gitlab.com': {
          server: 'gitlab',
          pathIndex: 3,
          pathValue: 'merge_requests',
          prIndex: 4,
          repoFormat: (parts) => `${parts[0]}/${parts[1]}`
        },
        'bitbucket.org': {
          server: 'bitbucket',
          pathIndex: 2,
          pathValue: 'pull-requests',
          prIndex: 3,
          repoFormat: (parts) => `${parts[0]}/${parts[1]}`
        }
      };
      
      // Find matching pattern
      for (const [domain, pattern] of Object.entries(patterns)) {
        if (urlObj.hostname.includes(domain)) {
          if (pathParts.length > pattern.prIndex && 
              pathParts[pattern.pathIndex] === pattern.pathValue) {
            const repo = pattern.repoFormat(pathParts);
            const prNumber = pathParts[pattern.prIndex];
            return { repo, prNumber, server: pattern.server };
          }
        }
      }
      
      // Default fallback
      return { repo: '', prNumber: '', server: 'github' };
    } catch (error) {
      console.error('Error parsing URL:', error);
      return { repo: '', prNumber: '', server: 'github' };
    }
  };

  // Add animation effect when button is clicked
  useEffect(() => {
    if (animateButton) {
      const timer = setTimeout(() => {
        setAnimateButton(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [animateButton]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setAnimateButton(true);
    
    if (validateForm()) {
      // Convert enabledChecks object to enabled_checks object format expected by backend
      const enabledChecksObj = {};
      Object.entries(formData.enabledChecks).forEach(([key, value]) => {
        enabledChecksObj[key] = value;
      });
      
      const { repo, prNumber, server } = extractInfoFromUrl(formData.prUrl.trim());
      
      // Ensure prNumber is a valid integer
      const parsedPrNumber = parseInt(prNumber);
      
      onAnalyze({
        pr_url: formData.prUrl.trim(),
        repo: repo || 'sample/repo',
        pr_number: isNaN(parsedPrNumber) ? 1 : parsedPrNumber,
        server: server || 'github',
        enabled_checks: enabledChecksObj
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const isDisabled = loading || serverStatus === 'offline';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-skycast-beige rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-skycast-blue mb-6 text-center">
          AI-Powered Pull Request Review
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pull Request URL Input */}
          <div>
            <label htmlFor="prUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pull Request URL or Repo Link <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 10-5.656-5.656l-1.102 1.101" />
                </svg>
              </div>
              <input
                type="text"
                id="prUrl"
                name="prUrl"
                value={formData.prUrl}
                onChange={handleInputChange}
                placeholder="Enter URL"
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-skycast-blue focus:border-skycast-blue ${
                  errors.prUrl ? 'border-red-500' : 'border-gray-300'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isDisabled}
              />
            </div>
            {errors.prUrl && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.prUrl}</p>
            )}
          </div>

          {/* Server Selection - Auto-detected from URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Git Server <span className="text-xs text-gray-500">(Auto-detected from URL)</span>
            </label>
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              <div
                className={`flex items-center justify-center px-4 py-2 rounded-md ${
                  formData.server === 'github' 
                    ? 'bg-skycast-blue text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </div>
              <div
                className={`flex items-center justify-center px-4 py-2 rounded-md ${
                  formData.server === 'gitlab' 
                    ? 'bg-skycast-blue text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"/>
                </svg>
                GitLab
              </div>
              <div
                className={`flex items-center justify-center px-4 py-2 rounded-md ${
                  formData.server === 'bitbucket' 
                    ? 'bg-skycast-blue text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.778 1.213c-.394.245-.595.622-.595 1.115 0 .062 0 .124.016.186l3.13 19.962c.062.43.4.778.84.84a.86.86 0 0 0 .137 0h15.289c.338 0 .654-.2.778-.53.062-.124.062-.247.062-.37 0-.063 0-.124-.016-.186l-3.13-19.963c-.062-.43-.4-.778-.84-.84a.86.86 0 0 0-.137 0H1.556c-.277 0-.554.093-.778.246zm8.927 14.012-1.792-9.5h5.561l1.793 9.5h-5.562z"/>
                </svg>
                Bitbucket
              </div>
            </div>
            <input 
              type="hidden" 
              name="server" 
              id="server" 
              value={formData.server} 
            />
          </div>

          {/* Customizable Rules */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Review Criteria
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="flex items-center">
                <input
                  id="style"
                  name="style"
                  type="checkbox"
                  checked={formData.enabledChecks.style}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      enabledChecks: {
                        ...prev.enabledChecks,
                        style: e.target.checked
                      }
                    }));
                  }}
                  className="h-4 w-4 text-skycast-blue focus:ring-skycast-blue border-gray-300 rounded"
                  disabled={isDisabled}
                />
                <label htmlFor="style" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Code Style
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="performance"
                  name="performance"
                  type="checkbox"
                  checked={formData.enabledChecks.performance}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      enabledChecks: {
                        ...prev.enabledChecks,
                        performance: e.target.checked
                      }
                    }));
                  }}
                  className="h-4 w-4 text-skycast-blue focus:ring-skycast-blue border-gray-300 rounded"
                  disabled={isDisabled}
                />
                <label htmlFor="performance" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Performance
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="security"
                  name="security"
                  type="checkbox"
                  checked={formData.enabledChecks.security}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      enabledChecks: {
                        ...prev.enabledChecks,
                        security: e.target.checked
                      }
                    }));
                  }}
                  className="h-4 w-4 text-skycast-blue focus:ring-skycast-blue border-gray-300 rounded"
                  disabled={isDisabled}
                />
                <label htmlFor="security" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Security
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="complexity"
                  name="complexity"
                  type="checkbox"
                  checked={formData.enabledChecks.complexity}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      enabledChecks: {
                        ...prev.enabledChecks,
                        complexity: e.target.checked
                      }
                    }));
                  }}
                  className="h-4 w-4 text-skycast-blue focus:ring-skycast-blue border-gray-300 rounded"
                  disabled={isDisabled}
                />
                <label htmlFor="complexity" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Complexity
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="ai_feedback"
                  name="ai_feedback"
                  type="checkbox"
                  checked={formData.enabledChecks.ai_feedback}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      enabledChecks: {
                        ...prev.enabledChecks,
                        ai_feedback: e.target.checked
                      }
                    }));
                  }}
                  className="h-4 w-4 text-skycast-blue focus:ring-skycast-blue border-gray-300 rounded"
                  disabled={isDisabled}
                />
                <label htmlFor="ai_feedback" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  AI Feedback
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isDisabled}
              className={`w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white transition-colors ${
                isDisabled
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-skycast-blue hover:bg-opacity-80 focus:ring-2 focus:ring-skycast-blue focus:ring-offset-2'
              } ${animateButton ? 'scale-95' : 'scale-100'} transition-transform duration-200`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Analyze PR
                </>
              )}
            </button>
          </div>

          {/* Server Status Warning */}
          {serverStatus === 'offline' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Server is currently offline. Please check your connection and try again.
                </p>
              </div>
            </div>
          )}
        </form>

        {/* Example Usage */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Examples:</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>GitHub:</strong> microsoft/vscode + PR #12345</p>
            <p><strong>GitLab:</strong> gitlab-org/gitlab + PR #25000</p>
            <p><strong>Bitbucket:</strong> atlassian/bitbucket + PR #5678</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputForm;
