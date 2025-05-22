import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api',
  withCredentials: true,
});


axiosInstance.interceptors.request.use((config) => {
  console.log(`📤 [Request] ${config.method.toUpperCase()} to ${config.url}`, config.data);
  return config;
}, (error) => {
  console.error('❌ [Request Error]', error);
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use((response) => {
  console.log(`✅ [Response] ${response.status} from ${response.config.url}`, response.data);
  return response;
}, (error) => {
  console.error('❌ [Response Error]', error.response || error);
  return Promise.reject(error);
});

export default axiosInstance;
