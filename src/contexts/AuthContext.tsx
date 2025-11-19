import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

interface User {
  id: string;
  email: string;
  name: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    console.log('[AuthContext] Initializing...');
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('[AuthContext] Checking auth status...');
    
    try {
      const result = await chrome.storage.local.get(['authToken', 'user', 'tokenExpiry']);
      
      console.log('[AuthContext] Storage check:', {
        has_token: !!result.authToken,
        has_user: !!result.user,
        has_expiry: !!result.tokenExpiry,
        user: result.user
      });
      
      if (result.authToken && result.user) {
        console.log('[AuthContext] User is authenticated:', result.user.email);
        setIsAuthenticated(true);
        setUser(result.user);
      } else {
        console.log('[AuthContext] User is not authenticated');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthContext] Error checking auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log('[AuthContext] Auth check completed');
    }
  };

  const login = async (token: string, userData: User) => {
    console.log('[AuthContext] Logging in user:', userData.email);
    await chrome.storage.local.set({ authToken: token, user: userData });
    setIsAuthenticated(true);
    setUser(userData);
    console.log('[AuthContext] User logged in successfully');
  };

  const logout = async () => {
    console.log('[AuthContext] Logging out user...');
    
    // Simulate logout delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    await chrome.storage.local.remove(['authToken', 'user', 'tokenExpiry']);
    setIsAuthenticated(false);
    setUser(null);
    console.log('[AuthContext] User logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

