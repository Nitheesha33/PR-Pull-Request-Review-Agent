import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
  // Add retry logic for network issues
  retry: 3,
  retryDelay: 1000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and retry logic
api.interceptors.response.use(
  (response) => {
    console.log(`Response received from ${response.config.url}:`, response.status);
    return response;
  },
  async (error) => {
    console.error("Response error:", error);
    
    const originalRequest = error.config;
    
    // Implement retry logic for network errors or 5xx server errors
    if ((error.request && !error.response) || (error.response && error.response.status >= 500)) {
      if (!originalRequest._retry) {
        originalRequest._retry = 0;
      }
      
      if (originalRequest._retry < (originalRequest.retry || 3)) {
        originalRequest._retry++;
        const delay = originalRequest.retryDelay || 1000;
        
        console.log(`Retrying request (${originalRequest._retry}/${originalRequest.retry || 3}) after ${delay}ms...`);
        
        return new Promise(resolve => {
          setTimeout(() => resolve(api(originalRequest)), delay);
        });
      }
    }
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.detail || error.response.data?.message || "Server error occurred";
      throw new Error(`${error.response.status}: ${message}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error("Network error: Unable to connect to the server");
    } else {
      // Something else happened
      throw new Error(error.message || "An unexpected error occurred");
    }
  }
);

// API functions

// Async analysis: submit job, poll for result
export const analyzePR = async (data, { pollInterval = 1000, timeout = 60000 } = {}) => {
  try {
    console.log("Sending data to API:", data);
    const response = await api.post("/analyze", data);
    const { job_id } = response.data;
    if (!job_id) throw new Error("No job_id returned from backend");

    // Poll for result
    const start = Date.now();
    while (true) {
      const pollRes = await api.get(`/analyze/${job_id}`);
      if (pollRes.data.status === "completed") {
        return pollRes.data.result;
      } else if (pollRes.data.status === "failed") {
        throw new Error(pollRes.data.error || "Analysis failed");
      }
      if (Date.now() - start > timeout) {
        throw new Error("Analysis timed out");
      }
      await new Promise(res => setTimeout(res, pollInterval));
    }
  } catch (error) {
    console.error("Error analyzing PR:", error);
    throw error;
  }
};

export const healthCheck = async () => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch (error) {
    console.error("Health check failed:", error);
    throw error;
  }
};

export default api;
