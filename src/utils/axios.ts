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

    // Handle only 401 errors
    // if (error.response?.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true;
    //   const refreshToken = localStorage.getItem('refreshToken');

    //   if (refreshToken) {
    //     try {
    //       const response = await axios.post(
    //         `https://xp-backend.sytes.net/auth/refresh`,
    //         { refreshToken }
    //       );

    //       const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

    //       localStorage.setItem('serviceToken', newAccessToken);
    //       localStorage.setItem('refreshToken', newRefreshToken);

    //       axiosServices.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
    //       originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

    //       return axiosServices(originalRequest);
    //     } catch (refreshError: any) {
    //       // Only logout if refresh endpoint itself returns 401 or 403
    //       if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
    //         console.warn('Refresh token expired or invalid, logging out.');
    //         localStorage.clear();
    //         window.location.href = '/login';
    //       } else {
    //         console.error('Temporary refresh error:', refreshError);
    //         // Maybe network error — just reject, don’t force logout
    //         return Promise.reject(refreshError);
    //       }
    //     }
    //   }
    // }

    return Promise.reject(error);
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
