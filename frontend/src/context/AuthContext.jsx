import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ── Regular user session ─────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Admin session (separate, stored in adminInfo) ─────────────────────────
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    // Load user session
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) setUser(JSON.parse(userInfo));

    // Load admin session independently
    const adminInfo = localStorage.getItem('adminInfo');
    if (adminInfo) {
      const admin = JSON.parse(adminInfo);
      setAdminUser(admin);
      // Pre-set the default auth header so all admin API calls are authenticated on page reload
      if (admin?.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${admin.token}`;
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          const message = error.response.data.message;
          if (
            message === 'Session expired or revoked. Please login again.' ||
            message === 'Not authorized, token failed' ||
            message === 'Not authorized, no token'
          ) {
            if (window.location.pathname.startsWith('/admin')) {
              localStorage.removeItem('adminInfo');
              window.location.href = '/admin-login';
            } else {
              localStorage.removeItem('userInfo');
              setUser(null);
              window.location.href = '/';
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // ── User Auth ─────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/auth/login', { email, password }, config);
      
      if (data.requireOTP) {
        return { success: true, requireOTP: true, message: data.message };
      }

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true, user: data };
    } catch (error) {
      return {
        success: false,
        error: error.response && error.response.data.message ? error.response.data.message : error.message,
      };
    }
  };

  const verifyLogin = async (email, otp) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/auth/login-verify', { email, otp }, config);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true, user: data };
    } catch (error) {
      return {
        success: false,
        error: error.response && error.response.data.message ? error.response.data.message : error.message,
      };
    }
  };

  const googleLogin = async (token, isLogin = false) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/auth/google', { token, isLogin }, config);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true, isNewUser: data.isNewUser, user: data };
    } catch (error) {
      return {
        success: false,
        error: error.response && error.response.data.message ? error.response.data.message : error.message,
      };
    }
  };

  const sendOTP = async (email) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/auth/send-otp', { email }, config);
      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response && error.response.data.message ? error.response.data.message : error.message,
      };
    }
  };

  const register = async (name, email, password, otp) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/auth/register', { name, email, password, otp }, config);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response && error.response.data.message ? error.response.data.message : error.message,
      };
    }
  };

  const logout = async () => {
    try {
      if (user && user.token) {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.post('/api/users/logout', {}, config);
      }
    } catch (error) {
      console.error('Logout API failed', error);
    }
    localStorage.removeItem('userInfo');
    setUser(null);
    window.location.href = '/';
  };

  const updateUserSession = (data) => {
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  // ── Admin Auth (completely separate session) ──────────────────────────────
  const adminLogin = async (email, password) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/auth/login', { email, password }, config);
      if (data.role !== 'admin') {
        return { success: false, error: 'Access denied. This account does not have admin privileges.' };
      }
      setAdminUser(data);
      localStorage.setItem('adminInfo', JSON.stringify(data));
      // Set global default so every subsequent admin axios call is authenticated
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response && error.response.data.message ? error.response.data.message : error.message,
      };
    }
  };

  const adminGoogleLogin = async (token) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/auth/google', { token, isLogin: true }, config);
      if (data.role !== 'admin') {
        return { success: false, error: 'Access denied. This Google account does not have admin privileges.' };
      }
      setAdminUser(data);
      localStorage.setItem('adminInfo', JSON.stringify(data));
      // Set global default so every subsequent admin axios call is authenticated
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response && error.response.data.message ? error.response.data.message : error.message,
      };
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('adminInfo');
    setAdminUser(null);
    // Clear the global auth header so regular user requests are not sent with admin token
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{
      // User session
      user, login, verifyLogin, googleLogin, sendOTP, register, logout, updateUserSession, loading,
      // Admin session (separate)
      adminUser, adminLogin, adminGoogleLogin, adminLogout,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
