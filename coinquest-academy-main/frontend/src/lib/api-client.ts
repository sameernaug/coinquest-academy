/** @format */

import { apiClient, ApiResponse } from './api';

// ==================== Types ====================

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  age?: number;
  grade?: string;
  school?: string;
  knowledgeLevel?: string;
  level: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  createdAt?: string;
  lastLogin?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface WalletData {
  _id?: string;
  lucreBalance: number;
  activeBalance: number;
  discretionaryBalance: number;
  totalEarned: number;
  lastPayout: string;
  expenses: {
    tax: number;
    rent: number;
    food: number;
    utilities: number;
    other: number;
  };
}

export interface Transaction {
  _id?: string;
  id?: string;
  date?: string;
  createdAt?: string;
  type: 'earning' | 'expense' | 'income';
  description: string;
  amount: number;
  balance?: number;
  balanceAfter?: number;
}

export interface Stock {
  _id?: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  history: number[];
  icon?: string;
  description?: string;
  sector?: string;
}

export interface Holding {
  symbol: string;
  shares: number;
  avgCost: number;
}

export interface Trade {
  _id?: string;
  id?: string;
  date?: string;
  createdAt?: string;
  symbol: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
}

export interface Portfolio {
  holdings: Holding[];
  trades: Trade[];
  portfolioValue: number;
  totalProfit: number;
}

export interface Module {
  _id?: string;
  id: number;
  title: string;
  description: string;
  lessons: Array<{
    id: string;
    title: string;
    duration: number;
    xpReward: number;
  }>;
  completed?: boolean;
  progress?: number;
}

export interface Lesson {
  _id?: string;
  slides: Array<{
    title: string;
    content: string;
    image?: string;
  }>;
}

export interface Quiz {
  _id?: string;
  questions: Array<{
    question: string;
    options: string[];
    correct: number;
  }>;
}

export interface QuizScore {
  score: number;
  total: number;
  date: string;
  timeSpent: number;
}

export interface Progress {
  _id?: string;
  user?: string;
  currentModule: number;
  completedModules: number[];
  completedLessons: string[];
  quizScores: Record<string, QuizScore>;
}

export interface Achievement {
  _id?: string;
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  total?: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  school?: string;
  level: number;
  xp: number;
  streak: number;
  profit?: number;
}

// ==================== Auth API ====================

export const authApi = {
  signup: async (data: {
    name: string;
    email: string;
    password: string;
    age?: number;
    grade?: string;
    school?: string;
    knowledgeLevel?: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>('/auth/signup', data);
  },

  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>('/auth/login', { email, password });
  },

  logout: async (): Promise<ApiResponse<{ ok: boolean }>> => {
    return apiClient.post<{ ok: boolean }>('/auth/logout');
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiClient.get<User>('/auth/me');
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    return apiClient.patch<User>('/auth/me', data);
  },

  addXP: async (amount: number): Promise<ApiResponse<User>> => {
    return apiClient.post<User>('/auth/xp', { amount });
  },
};

// ==================== Wallet API ====================

export const walletApi = {
  getWallet: async (): Promise<ApiResponse<{ wallet: WalletData; transactions: Transaction[] }>> => {
    return apiClient.get<{ wallet: WalletData; transactions: Transaction[] }>('/wallet');
  },

  earn: async (amount: number, description: string): Promise<ApiResponse<WalletData>> => {
    return apiClient.post<WalletData>('/wallet/earn', { amount, description });
  },

  addDiscretionary: async (amount: number, description: string): Promise<ApiResponse<WalletData>> => {
    return apiClient.post<WalletData>('/wallet/discretionary/add', { amount, description });
  },

  deductDiscretionary: async (amount: number, description: string): Promise<ApiResponse<WalletData>> => {
    return apiClient.post<WalletData>('/wallet/discretionary/deduct', { amount, description });
  },

  payout: async (): Promise<ApiResponse<WalletData>> => {
    return apiClient.post<WalletData>('/wallet/payout');
  },

  updateExpenses: async (expenses: WalletData['expenses']): Promise<ApiResponse<WalletData>> => {
    return apiClient.put<WalletData>('/wallet/expenses', expenses);
  },
};

// ==================== Stocks API ====================

export const stocksApi = {
  getStocks: async (): Promise<ApiResponse<Stock[]>> => {
    return apiClient.get<Stock[]>('/stocks');
  },

  getPortfolio: async (): Promise<ApiResponse<Portfolio>> => {
    return apiClient.get<Portfolio>('/stocks/portfolio');
  },

  buyStock: async (symbol: string, shares: number): Promise<ApiResponse<Portfolio>> => {
    return apiClient.post<Portfolio>(`/stocks/${symbol}/buy`, { shares });
  },

  sellStock: async (symbol: string, shares: number): Promise<ApiResponse<Portfolio>> => {
    return apiClient.post<Portfolio>(`/stocks/${symbol}/sell`, { shares });
  },

  refreshStocks: async (): Promise<ApiResponse<Stock[]>> => {
    return apiClient.post<Stock[]>('/stocks/refresh');
  },
};

// ==================== Learning API ====================

export const learningApi = {
  getModules: async (): Promise<ApiResponse<Module[]>> => {
    return apiClient.get<Module[]>('/learning/modules');
  },

  getProgress: async (): Promise<ApiResponse<Progress>> => {
    return apiClient.get<Progress>('/learning/progress');
  },

  getLesson: async (moduleId: string, lessonId: string): Promise<ApiResponse<Lesson>> => {
    return apiClient.get<Lesson>(`/learning/lessons/${moduleId}/${lessonId}`);
  },

  completeLesson: async (moduleId: string, lessonId: string): Promise<ApiResponse<Progress>> => {
    return apiClient.post<Progress>(`/learning/lessons/${moduleId}/${lessonId}/complete`);
  },

  getQuiz: async (moduleId: string): Promise<ApiResponse<Quiz>> => {
    return apiClient.get<Quiz>(`/learning/quizzes/${moduleId}`);
  },

  submitQuiz: async (moduleId: string, answers: number[], timeSpent: number): Promise<ApiResponse<Progress>> => {
    return apiClient.post<Progress>(`/learning/quizzes/${moduleId}/submit`, { answers, timeSpent });
  },
};

// ==================== Achievements API ====================

export const achievementsApi = {
  getAchievements: async (): Promise<ApiResponse<Achievement[]>> => {
    return apiClient.get<Achievement[]>('/achievements');
  },

  checkAchievements: async (): Promise<ApiResponse<Achievement[]>> => {
    return apiClient.post<Achievement[]>('/achievements/check');
  },
};

// ==================== Leaderboard API ====================

export const leaderboardApi = {
  getLeaderboard: async (limit: number = 50): Promise<ApiResponse<LeaderboardEntry[]>> => {
    return apiClient.get<LeaderboardEntry[]>(`/leaderboard?limit=${limit}`);
  },

  getMyRank: async (): Promise<ApiResponse<LeaderboardEntry>> => {
    return apiClient.get<LeaderboardEntry>('/leaderboard/me');
  },
};

