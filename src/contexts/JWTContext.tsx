import React, { createContext, useEffect, useReducer } from 'react';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { Chance } from 'chance';

// reducer - state management
import { LOGIN, LOGOUT } from 'contexts/auth-reducer/actions';
import authReducer from 'contexts/auth-reducer/auth';

// project import
import Loader from 'components/Loader';
import axiosServices from 'utils/axios';
import { AuthProps, JWTContextType } from 'types/auth';

// ==============================|| INITIAL STATE ||============================== //

const chance = new Chance();

const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

// ==============================|| HELPERS ||============================== //

// verify if access token is valid
const verifyToken = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.exp) return false;
    return decoded.exp > Date.now() / 1000;
  } catch (err) {
    return false;
  }
};

// set or clear Authorization header
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

// ==============================|| CONTEXT ||============================== //

const JWTContext = createContext<JWTContextType | null>(null);

export const JWTProvider = ({ children }: { children: React.ReactElement }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ==============================|| INITIALIZE AUTH ||============================== //
  useEffect(() => {
    const init = async () => {
      try {
        const accessToken = localStorage.getItem('serviceToken');
        const refreshToken = localStorage.getItem('refreshToken');

        // 1️⃣ Access token still valid — keep user logged in
        if (accessToken && verifyToken(accessToken)) {
          setSession(accessToken);
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user: JSON.parse(localStorage.getItem('user') || '{}')
            }
          });
          return;
        }

        // 2️⃣ Access token expired → attempt refresh
        if (refreshToken) {
          const response = await axiosServices.post('https://161.97.134.211:4443/auth/refresh', {
            refreshToken
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

          if (newAccessToken) {
            localStorage.setItem('serviceToken', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            setSession(newAccessToken);

            dispatch({
              type: LOGIN,
              payload: {
                isLoggedIn: true,
                user: JSON.parse(localStorage.getItem('user') || '{}')
              }
            });
            return;
          }
        }

        // 3️⃣ No valid tokens → logout
        setSession(null);
        dispatch({ type: LOGOUT });
      } catch (error) {
        console.error('Auth initialization error:', error);
        setSession(null);
        dispatch({ type: LOGOUT });
      }
    };

    init();
  }, []);

  // ==============================|| AUTH ACTIONS ||============================== //

  const login = async (email: string, password: string) => {
    setSession();
    const response = await axiosServices.post('https://161.97.134.211:4443/auth', { email, password });

    const { token, user } = response.data;
    const { accessToken, refreshToken } = token;

    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', user.role);

    setSession(accessToken);

    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user
      }
    });
  };

  const register = async (email: string, password: string, displayName: string) => {
    const id = chance.bb_pin();
    await axiosServices.post('https://161.97.134.211:4443/auth/signup', {
      id,
      email,
      password,
      displayName
    });
  };

  const logout = () => {
    setSession(null);
    dispatch({ type: LOGOUT });
  };

  const resetPassword = async (email: string) => {};
  const updateProfile = () => {};

  if (!state.isInitialized) {
    return <Loader />;
  }

  return (
    <JWTContext.Provider
      value={{
        ...state,
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
