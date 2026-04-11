// src/context/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import {
  buildAuthConfig,
  clearStoredAuth,
  readStoredAuth,
  writeStoredAuth,
} from '../utils/auth.js';

export const AuthContext = createContext(null);

// Named hook so you can `import { useAuth } from '../context/AuthProvider'`
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:1402';
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const hydrateAuth = async () => {
      const storedAuth = readStoredAuth();
      if (!storedAuth?.token) {
        clearStoredAuth();
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `${baseURL}/user/me`,
          buildAuthConfig(storedAuth.token)
        );

        if (cancelled) return;

        writeStoredAuth({ token: storedAuth.token, user: data.user });
        setToken(storedAuth.token);
        setUser(data.user);
      } catch {
        clearStoredAuth();
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    hydrateAuth();
    return () => {
      cancelled = true;
    };
  }, [baseURL]);

  const persistAuth = ({ token: nextToken, user: nextUser }) => {
    writeStoredAuth({ token: nextToken, user: nextUser });
    setToken(nextToken);
    setUser(nextUser);
  };

  const signup = async (payload) => {
    const { data } = await axios.post(`${baseURL}/user/signup`, payload);
    persistAuth(data);
    return data;
  };

  const login = async (payload) => {
    const { data } = await axios.post(`${baseURL}/user/login`, payload);
    persistAuth(data);
    return data;
  };

  const logout = () => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
