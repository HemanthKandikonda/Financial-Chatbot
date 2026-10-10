import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally (only redirect if not on login/register page)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fb_token');
      localStorage.removeItem('fb_user');
      const pathname = window.location.pathname;
      if (pathname !== '/login' && pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Chat
export const chatAPI = {
  getHistory: () => api.get('/chat/history'),
  getChat: (chatId) => api.get(`/chat/${chatId}`),
  sendMessage: (data) => api.post('/chat', data),
  deleteChat: (chatId) => api.delete(`/chat/${chatId}`),
  renameChat: (chatId, title) => api.put(`/chat/${chatId}/title`, { title }),
  getModels: () => api.get('/chat/models'),
};

// Config
export const configAPI = {
  getConfig: () => api.get('/config'),
  updateConfig: (data) => api.put('/config', data),
  resetConfig: () => api.delete('/config/reset'),
};



export default api;
