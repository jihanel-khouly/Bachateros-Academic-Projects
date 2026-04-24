import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة التوكن لكل الطلبات
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// معالجة الأخطاء - التعديل هنا
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // ركز هنا: بنطرد المستخدم فقط لو التوكن نفسه انتهى (Auth Error)
    // مش لو الماستر باسورد هو اللي غلط
    const isAuthRequest = error.config.url.includes('/auth/login');
    const isMasterPasswordRequest = error.config.url.includes('/master-password/verify');

    if (error.response?.status === 401 && !isMasterPasswordRequest && !isAuthRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (email, username, password) =>
    apiClient.post('/auth/register', { email, username, password }),
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
};

export const masterPasswordAPI = {
  setup: (password) =>
    apiClient.post('/master-password/setup', { password }),
  verify: (password) =>
    apiClient.post('/master-password/verify', { password }),
};

export const credentialsAPI = {
  list: () =>
    apiClient.get('/credentials/list'),
  getOne: (id, masterPassword) =>
    apiClient.get(`/credentials/${id}`, { 
      params: { masterPassword },
      headers: { 'x-master-password': masterPassword } 
    }),
  add: (serviceName, username, password, masterPassword) =>
    apiClient.post('/credentials/add', { serviceName, username, password, masterPassword }),
  delete: (id, masterPassword) =>
    apiClient.delete(`/credentials/${id}`, { params: { masterPassword } }),
  generatePassword: (length = 16) =>
    apiClient.get('/credentials/generate/password', { params: { length } }),
};

export default apiClient;