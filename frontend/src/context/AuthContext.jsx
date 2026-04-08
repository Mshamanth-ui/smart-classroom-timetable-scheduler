import { createContext, useContext, useState, useCallback } from 'react';
import { login as loginApi } from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const login = useCallback(async (username, password) => {
    const res = await loginApi({ username, password });
    const { token, ...userData } = res.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out');
  }, []);

  const can = useCallback((action) => {
    if (!user) return false;
    
    // Check for role-based access
    if (action === 'admin') return user.role === 'ADMIN';
    if (action === 'settings') return user.role === 'ADMIN';
    
    const perms = {
      ADMIN:   ['view','add','edit','delete','export','settings','reports'],
      TEACHER: ['view','export','reports'],
      VIEWER:  ['view','reports'],
    };
    return perms[user.role]?.includes(action) ?? false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
