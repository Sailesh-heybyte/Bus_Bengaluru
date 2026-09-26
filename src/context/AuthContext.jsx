import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'kbus_demo_user';

export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {}
});

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.phone) {
          setUser(parsed);
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      console.error('Error reading auth from localStorage:', e);
    }
  }, []);

  const login = (phone) => {
    const userData = {
      phone,
      timestamp: Date.now()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (e) {
      console.error('Error saving auth to localStorage:', e);
    }
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error removing auth from localStorage:', e);
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
