import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to attach Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pixelvault_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to catch 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/google')) {
        localStorage.removeItem('pixelvault_token');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, password_confirmation) =>
    api.post('/auth/register', { name, email, password, password_confirmation }),
  googleAuth: (payload) => api.post('/auth/google', payload),
  getUser: () => api.get('/auth/user'),
  logout: () => api.post('/auth/logout'),
};

export const foldersApi = {
  list: (parentId = null) => api.get('/folders', { params: { parent_id: parentId } }),
  create: (name, parentId = null, color = null) =>
    api.post('/folders', { name, parent_id: parentId, color }),
  update: (id, name, color = null) => api.put(`/folders/${id}`, { name, color }),
  delete: (id) => api.delete(`/folders/${id}`),
};

export const imagesApi = {
  list: (params) => api.get('/images', { params }),
  upload: (formData, onProgress) =>
    api.post('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
  get: (id) => api.get(`/images/${id}`),
  toggleStar: (id) => api.post(`/images/${id}/star`),
  moveToTrash: (id) => api.post(`/images/${id}/trash`),
  restore: (id) => api.post(`/images/${id}/restore`),
  moveToFolder: (id, folderId) => api.post(`/images/${id}/move`, { folder_id: folderId }),
  emptyTrash: () => api.post('/images/empty-trash'),
  delete: (id) => api.delete(`/images/${id}`),
};

export const subscriptionApi = {
  getPlans: () => api.get('/subscriptions/plans'),
  getCurrent: () => api.get('/subscriptions/current'),
  checkoutStripe: (planId, billingCycle) =>
    api.post('/subscriptions/checkout/stripe', { plan_id: planId, billing_cycle: billingCycle }),
  checkoutRazorpay: (planId, billingCycle, currency) =>
    api.post('/subscriptions/checkout/razorpay', { plan_id: planId, billing_cycle: billingCycle, currency }),
  verifyRazorpay: (payload) => api.post('/subscriptions/verify/razorpay', payload),
  completeUpgrade: (planId, gateway, billingCycle, transactionId) =>
    api.post('/subscriptions/upgrade', {
      plan_id: planId,
      gateway,
      billing_cycle: billingCycle,
      transaction_id: transactionId,
    }),
  cancel: () => api.post('/subscriptions/cancel'),
};

export const storageApi = {
  getStatus: () => api.get('/storage/status'),
  testR2: () => api.post('/storage/test-r2'),
};

export default api;
