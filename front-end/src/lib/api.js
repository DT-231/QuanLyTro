import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Biến để lưu promise refresh token (tránh gọi nhiều lần đồng thời)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request Interceptor - Thêm token vào header
api.interceptors.request.use(
  (config) => {
    const rawToken = localStorage.getItem("token");

    if (rawToken) {
      let tokenToUse = rawToken; 
      try {
        const parsed = JSON.parse(rawToken);
        if (parsed && parsed.access_token) {
           tokenToUse = parsed.access_token;
        } 
      } catch (e) {
      }
      if (tokenToUse && typeof tokenToUse === 'string') {
          config.headers.Authorization = `Bearer ${tokenToUse}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
