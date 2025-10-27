import axios, { AxiosRequestConfig } from 'axios';

const axiosServices = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost:4000/',
});

// ==============================|| REQUEST INTERCEPTOR ||============================== //
axiosServices.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('serviceToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==============================|| RESPONSE INTERCEPTOR (AUTO REFRESH) ||============================== //
axiosServices.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors and avoid retry loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_APP_API_URL || 'http://localhost:4000/'}auth/refresh`,
            { refreshToken }
          );

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

          // ✅ Update local storage and headers
          localStorage.setItem('serviceToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          axiosServices.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

          // Retry the original failed request
          return axiosServices(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Clear tokens and redirect to login
          localStorage.removeItem('serviceToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('role');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else {
        // No refresh token — force logout
        localStorage.removeItem('serviceToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    // Fallback: redirect to maintenance page for other errors
    if (error.response?.status === 401 && !window.location.href.includes('/login')) {
      window.location.pathname = '/maintenance/500';
    }

    return Promise.reject(
      (error.response && error.response.data) || 'Unexpected error with API'
    );
  }
);

// ==============================|| FETCHER HELPERS ||============================== //

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  const res = await axiosServices.get(url, { ...config });
  return res.data;
};

export const fetcherPost = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  const res = await axiosServices.post(url, { ...config });
  return res.data;
};

export default axiosServices;
