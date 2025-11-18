import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  grade: string;
  school: string;
  level: number;
  xp: number;
  knowledgeLevel: string;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
  lastLogin: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (userData: Omit<User, 'id' | 'level' | 'xp' | 'currentStreak' | 'longestStreak' | 'createdAt' | 'lastLogin'>, password: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addXP: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      
      // Update streak
      const lastLogin = new Date(parsedUser.lastLogin);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        parsedUser.currentStreak += 1;
        parsedUser.longestStreak = Math.max(parsedUser.longestStreak, parsedUser.currentStreak);
      } else if (daysDiff > 1) {
        parsedUser.currentStreak = 1;
      }
      
      parsedUser.lastLogin = today.toISOString();
      localStorage.setItem('user', JSON.stringify(parsedUser));
      setUser(parsedUser);
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userKey = email.toLowerCase();
    
    if (users[userKey] && users[userKey].password === password) {
      const userData = users[userKey].data;
      
      // Update streak
      const lastLogin = new Date(userData.lastLogin);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        userData.currentStreak += 1;
        userData.longestStreak = Math.max(userData.longestStreak, userData.currentStreak);
      } else if (daysDiff > 1) {
        userData.currentStreak = 1;
      }
      
      userData.lastLogin = today.toISOString();
      
      localStorage.setItem('user', JSON.stringify(userData));
      users[userKey].data = userData;
      localStorage.setItem('users', JSON.stringify(users));
      
      setUser(userData);
      return true;
    }
    return false;
  };

  const signup = (userData: Omit<User, 'id' | 'level' | 'xp' | 'currentStreak' | 'longestStreak' | 'createdAt' | 'lastLogin'>, password: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userKey = userData.email.toLowerCase();
    
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      level: 1,
      xp: 0,
      currentStreak: 1,
      longestStreak: 1,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    
    users[userKey] = { password, data: newUser };
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update in users list
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      const userKey = user.email.toLowerCase();
      if (users[userKey]) {
        users[userKey].data = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
  };

  const addXP = (amount: number) => {
    if (user) {
      const newXP = user.xp + amount;
      const newLevel = Math.floor(newXP / 250) + 1;
      updateUser({ xp: newXP, level: newLevel });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, addXP }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
