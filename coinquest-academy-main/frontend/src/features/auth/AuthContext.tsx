import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { authApi, User as ApiUser } from '@/lib/api-client';

interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  grade?: string;
  school?: string;
  level: number;
  xp: number;
  knowledgeLevel?: string;
  currentStreak: number;
  longestStreak: number;
  createdAt?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Omit<User, 'id' | 'level' | 'xp' | 'currentStreak' | 'longestStreak' | 'createdAt' | 'lastLogin'>, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  loading: boolean;
}

// Normalize API user to frontend User format
const normalizeUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser._id || apiUser.id || '',
    name: apiUser.name,
    email: apiUser.email,
    age: apiUser.age,
    grade: apiUser.grade,
    school: apiUser.school,
    level: apiUser.level,
    xp: apiUser.xp,
    knowledgeLevel: apiUser.knowledgeLevel,
    currentStreak: apiUser.currentStreak,
    longestStreak: apiUser.longestStreak,
    createdAt: apiUser.createdAt,
    lastLogin: apiUser.lastLogin,
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await authApi.getProfile();
          if (response.success && response.data) {
            setUser(normalizeUser(response.data));
          }
        } catch (error: any) {
          // Token invalid or expired
          localStorage.removeItem('auth_token');
          console.error('Auth check failed:', error.message);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login(email, password);
      if (response.success && response.data) {
        localStorage.setItem('auth_token', response.data.token);
        setUser(normalizeUser(response.data.user));
        toast.success('Welcome back!');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || 'Invalid email or password');
      return false;
    }
  };

  const signup = async (userData: Omit<User, 'id' | 'level' | 'xp' | 'currentStreak' | 'longestStreak' | 'createdAt' | 'lastLogin'>, password: string): Promise<void> => {
    try {
      const response = await authApi.signup({
        name: userData.name,
        email: userData.email,
        password,
        age: userData.age,
        grade: userData.grade,
        school: userData.school,
        knowledgeLevel: userData.knowledgeLevel,
      });
      if (response.success && response.data) {
        localStorage.setItem('auth_token', response.data.token);
        setUser(normalizeUser(response.data.user));
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    if (!user) return;

    try {
      const response = await authApi.updateProfile(updates);
      if (response.success && response.data) {
        setUser(normalizeUser(response.data));
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  const addXP = async (amount: number): Promise<void> => {
    if (!user) return;

    try {
      const response = await authApi.addXP(amount);
      if (response.success && response.data) {
        setUser(normalizeUser(response.data));
      }
    } catch (error: any) {
      console.error('Failed to add XP:', error.message);
      // Don't show error toast for XP updates, just log it
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, addXP, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
