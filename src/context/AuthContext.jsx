import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * AuthContext — provides user auth state and helpers to the entire app.
 *
 * Stored in localStorage:
 *   sparsh_token   → the JWT
 *   sparsh_user    → serialised user object (userId, fullName, email, profilePicture, authProvider, role)
 */

const AuthContext = createContext(null);

const TOKEN_KEY = 'sparsh_token';
const USER_KEY  = 'sparsh_user';

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken]   = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user,  setUser]    = useState(readStoredUser);

  /** Call this after a successful login/register response */
  const saveAuth = useCallback((authResponse) => {
    const { token: t, ...userInfo } = authResponse;
    if (!t) throw new Error('Authentication response did not include a token.');
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY,  JSON.stringify(userInfo));
    setToken(t);
    setUser(userInfo);
  }, []);

  /** Clear all auth state */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/** Hook to consume auth context */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
