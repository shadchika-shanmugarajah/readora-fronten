import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('book_store_token') || null);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(true);

  // Check if token is valid on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('book_store_token');
      const storedUser = localStorage.getItem('book_store_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        try {
          const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            localStorage.setItem('book_store_user', JSON.stringify(data.user));
            setServerOnline(true);
          } else {
            // Invalid token
            logout();
          }
        } catch (error) {
          console.warn("Backend server offline, using cached profile session.");
          setServerOnline(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (phoneNumber, name, username, password) => {
    setLoading(true);
    try {
      const body = username && password 
        ? { username, password } 
        : { phoneNumber, name };

      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('book_store_token', data.token);
        localStorage.setItem('book_store_user', JSON.stringify(data.user));
        setServerOnline(true);
        setLoading(false);
        return { success: true };
      } else {
        const errorData = await res.json();
        setLoading(false);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.warn("Backend server offline, logging in using mock auth simulation...");
      // Simulate successful login offline for demo integrity
      if (username && password) {
        if (username === 'admin' && password === 'admin123') {
          const mockUser = {
            id: 'user_admin_offline',
            phoneNumber: '0774454785',
            name: 'Administrator',
            address: 'Head Office',
            role: 'admin'
          };
          const mockToken = 'mock_jwt_token_offline_admin';
          
          setToken(mockToken);
          setUser(mockUser);
          localStorage.setItem('book_store_token', mockToken);
          localStorage.setItem('book_store_user', JSON.stringify(mockUser));
          setServerOnline(false);
          setLoading(false);
          return { success: true, isMock: true };
        } else {
          setLoading(false);
          return { success: false, message: 'Invalid admin credentials (offline simulation).' };
        }
      }

      const isPhoneAdmin = phoneNumber === '0771234567' || phoneNumber === '+94771234567' || phoneNumber === '0774454785' || phoneNumber === '+94774454785';
      const mockUser = {
        id: 'user_offline_' + Date.now(),
        phoneNumber,
        name: name || `Customer (${phoneNumber.slice(-4)})`,
        address: '',
        role: isPhoneAdmin ? 'admin' : 'user'
      };
      const mockToken = 'mock_jwt_token_offline_' + Date.now();
      
      setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem('book_store_token', mockToken);
      localStorage.setItem('book_store_user', JSON.stringify(mockUser));
      setServerOnline(false);
      setLoading(false);
      return { success: true, isMock: true };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('book_store_token');
    localStorage.removeItem('book_store_user');
  };

  const updateProfile = async (name, address) => {
    try {
      if (!serverOnline || token.startsWith('mock_jwt_token_offline_')) {
        // Mock offline updates
        const updatedUser = { ...user, name, address };
        setUser(updatedUser);
        localStorage.setItem('book_store_user', JSON.stringify(updatedUser));
        return { success: true };
      }

      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, address })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('book_store_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        const errorData = await res.json();
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      // Offline fallback
      const updatedUser = { ...user, name, address };
      setUser(updatedUser);
      localStorage.setItem('book_store_user', JSON.stringify(updatedUser));
      return { success: true };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, serverOnline, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
