import React, { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import Loader from './components/Loader';
import { analyzePR, healthCheck } from './api/backend';

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');

  // Check server health on component mount
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const data = await healthCheck();
        setServerStatus(data.status === "ok" ? "online" : "offline");
      } catch (error) {
        setServerStatus("offline");
        console.error("Server health check failed:", error);
      }
    };

    // Initial check
    checkServerHealth();
    
    // Set up periodic health checks
    const healthCheckInterval = setInterval(checkServerHealth, 30000); // Check every 30 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(healthCheckInterval);
  }, []);

    const handleAnalyze = async (formData) => {
      setLoading(true);
      setError(null);
      setAnalysisResult(null);

      try {
        if (serverStatus !== "online") {
          throw new Error("Server is offline. Please try again later.");
        }
        const result = await analyzePR(formData);
        setAnalysisResult(result);
      } catch (error) {
        const errorMessage = error.response?.data?.detail || error.message || "An error occurred during analysis";
        setError(errorMessage);
        console.error("Analysis error:", error);
      } finally {
        setLoading(false);
      }
    };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            PR Review Agent
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Analyze your pull requests for code quality, style, and potential issues
          </p>
          
          {/* Server Status Indicator */}
          <div className="flex justify-center items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              serverStatus === 'online' ? 'bg-green-500' : 
              serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              Server: {serverStatus === 'online' ? 'Online' : 
                      serverStatus === 'offline' ? 'Offline' : 'Checking...'}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {!analysisResult ? (
            <div className="fade-in">
              <InputForm 
                onAnalyze={handleAnalyze} 
                loading={loading}
                serverStatus={serverStatus}
              />
            </div>
          ) : (
            <div className="fade-in">
              {/* Back Button */}
              <div className="mb-6 flex justify-end">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-skycast-blue hover:bg-opacity-80 text-white rounded-lg transition-colors"
                >
                  Analyze Another PR
                </button>
              </div>
              
              {/* Results Display */}
              <ResultsDisplay results={analysisResult} />
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="fixed inset-0 bg-skycast-blue bg-opacity-30 flex items-center justify-center z-50">
              <Loader />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Analysis Failed
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
