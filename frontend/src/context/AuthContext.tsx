import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { API_URL, IS_DEV_MODE, DEV_MOCK_USER } from '../config';

axios.defaults.withCredentials = true;

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshSession: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/session`, {
        withCredentials: true,
      });
      setUser(response.data.user);
      console.log('Session:', response.data.user);
    } catch {
      setUser(null);
      console.log('Session:', null);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // In dev mode on localhost, auto-inject mock user
        if (IS_DEV_MODE) {
          console.log('[DEV MODE] Auto-loading mock user for local testing');
          setUser(DEV_MOCK_USER);
        } else {
          await refreshSession();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, null, {
        withCredentials: true,
      });
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
