import { createContext, useContext, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      await authService.login(email, password);
      
    } catch (err) {
      setError(err.message);
      throw new Error("");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      await authService.register(name, email, password);
      
    } catch (err) {
      setError(err.message);
      throw new Error("");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('accessToken');
    window.location.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ isLoading, error, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
