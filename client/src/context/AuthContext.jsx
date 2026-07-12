import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'chat:username';

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) || ''
  );

  const login = useCallback((name) => {
    sessionStorage.setItem(STORAGE_KEY, name);
    setUsername(name);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUsername('');
  }, []);

  return (
    <AuthContext.Provider value={{ username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
