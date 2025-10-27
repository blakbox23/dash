import React, { createContext, useEffect, useState } from 'react';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { Chance } from 'chance';
import axiosServices from 'utils/axios';
import Loader from 'components/Loader';
import { AuthProps, JWTContextType } from 'types/auth';

const chance = new Chance();

const JWTContext = createContext<JWTContextType | null>(null);

// ==============================|| HELPERS ||============================== //

const verifyToken = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp ? decoded.exp > Date.now() / 1000 : false;
  } catch {
    return false;
  }
};

const setSession = (accessToken?: string | null) => {
  if (accessToken) {
    localStorage.setItem('serviceToken', accessToken);
    axiosServices.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem('serviceToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    delete axiosServices.defaults.headers.common.Authorization;
  }
};

// ==============================|| PROVIDER ||============================== //

export const JWTProvider = ({ children }: { children: React.ReactElement }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Initialize auth state
  useEffect(() => {
    const init = async () => {
      try {
        const accessToken = localStorage.getItem('serviceToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const savedUser = localStorage.getItem('user');

        if (accessToken && verifyToken(accessToken)) {
          setSession(accessToken);
          setUser(savedUser ? JSON.parse(savedUser) : null);
          setIsLoggedIn(true);
        } else if (refreshToken) {
          try {
            const response = await axiosServices.post('https://xp-backend.sytes.net/auth/refresh', { refreshToken });
            const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = response.data;

            if (newAccessToken) {
              localStorage.setItem('serviceToken', newAccessToken);
              localStorage.setItem('refreshToken', newRefreshToken);
              if (user) localStorage.setItem('user', JSON.stringify(user));

              setSession(newAccessToken);
              setUser(user);
              setIsLoggedIn(true);
            }
          } catch (refreshError) {
            console.warn('Token refresh failed, logging out:', refreshError);
            setSession(null);
            setIsLoggedIn(false);
          }
        } else {
          setSession(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setSession(null);
        setIsLoggedIn(false);
      } finally {
        setIsInitialized(true);
      }
    };

    init();
  }, []);

  // ==============================|| AUTH ACTIONS ||============================== //

  const login = async (email: string, password: string) => {
    const response = await axiosServices.post('https://xp-backend.sytes.net/auth', { email, password });
    const { token, user } = response.data;
    const { accessToken, refreshToken } = token;

    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', user.role);

    setSession(accessToken);
    setUser(user);
    setIsLoggedIn(true);
  };

  const register = async (email: string, password: string, displayName: string) => {
    const id = chance.bb_pin();
    await axiosServices.post('https://xp-backend.sytes.net/auth/signup', { id, email, password, displayName });
  };

  const logout = () => {
    setSession(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  const resetPassword = async (email: string) => {};
  const updateProfile = () => {};

  if (!isInitialized) return <Loader />;

  return (
    <JWTContext.Provider
      value={{
        isInitialized,
        isLoggedIn,
        user,
        login,
        logout,
        register,
        resetPassword,
        updateProfile
      }}
    >
      {children}
    </JWTContext.Provider>
  );
};

export default JWTContext;
