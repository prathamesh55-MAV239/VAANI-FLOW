import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vaaniflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid infinite redirect loop if checking /me
      if (!error.config.url.includes('/auth/me')) {
        localStorage.removeItem('vaaniflow_token');
        localStorage.removeItem('vaaniflow_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

// ------------------------------------------------------------
// API SERVICE METHODS
// ------------------------------------------------------------

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  async login(data) {
    const res = await api.post('/auth/login', data);
    return res.data;
  },
  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },
  async logout() {
    const res = await api.post('/auth/logout');
    return res.data;
  },
};

export const conversationService = {
  async list() {
    const res = await api.get('/conversations');
    return res.data;
  },
  async create(title) {
    const res = await api.post('/conversations', { title });
    return res.data;
  },
  async get(id) {
    const res = await api.get(`/conversations/${id}`);
    return res.data;
  },
  async update(id, title) {
    const res = await api.patch(`/conversations/${id}`, { title });
    return res.data;
  },
  async delete(id) {
    const res = await api.delete(`/conversations/${id}`);
    return res.data;
  },
  async getMessages(id) {
    const res = await api.get(`/conversations/${id}/messages`);
    return res.data;
  },
};

export const aiService = {
  async chat({ conversationId, message, inputLanguage = 'en', responseLanguage = 'en' }) {
    const res = await api.post('/ai/chat', {
      conversationId,
      message,
      inputLanguage,
      responseLanguage,
    });
    return res.data;
  },
  async transcribe({ audio, mimeType, language }) {
    const res = await api.post('/ai/transcribe', { audio, mimeType, language });
    return res.data;
  },
  async speak({ text, language }) {
    const res = await api.post('/ai/speak', { text, language });
    return res.data;
  },
  async translate({ text, sourceLanguage, targetLanguage }) {
    const res = await api.post('/ai/translate', { text, sourceLanguage, targetLanguage });
    return res.data;
  },
  async health() {
    const res = await api.get('/health');
    return res.data;
  },
};

export default {
  api,
  auth: authService,
  conversation: conversationService,
  ai: aiService,
};
