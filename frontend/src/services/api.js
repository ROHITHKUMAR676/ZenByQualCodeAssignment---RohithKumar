import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'https://zenbyqualcodeassignment-rohithkumar.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const modulesService = {
  getAll: (params = {}) => api.get('/modules', { params }),
  getById: (id) => api.get(`/modules/${id}`),
  create: (data) => api.post('/modules', data),
  update: (id, data) => api.put(`/modules/${id}`, data),
  getReviewQueue: (params = {}) => api.get('/modules/review-queue', { params }),
};

export default api;
