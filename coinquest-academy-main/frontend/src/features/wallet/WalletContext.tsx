import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { walletApi, WalletData, Transaction } from '@/lib/api-client';

interface WalletContextType {
  wallet: WalletData;
  transactions: Transaction[];
  addToLucre: (amount: number, description: string) => Promise<void>;
  deductFromDiscretionary: (amount: number, description: string) => Promise<boolean>;
  addToDiscretionary: (amount: number, description: string) => Promise<void>;
  processWeeklyPayout: () => Promise<void>;
  allocateExpenses: (expenses: WalletData['expenses']) => Promise<void>;
  loading: boolean;
  refreshWallet: () => Promise<void>;
}

// Normalize wallet data from API
const normalizeWallet = (apiWallet: WalletData): WalletData => {
  return {
    _id: apiWallet._id,
    lucreBalance: apiWallet.lucreBalance,
    activeBalance: apiWallet.activeBalance,
    discretionaryBalance: apiWallet.discretionaryBalance,
    totalEarned: apiWallet.totalEarned,
    lastPayout: apiWallet.lastPayout,
    expenses: apiWallet.expenses,
  };
};

// Normalize transaction data from API
const normalizeTransaction = (apiTxn: Transaction): Transaction => {
  return {
    _id: apiTxn._id,
    id: apiTxn._id || apiTxn.id,
    date: apiTxn.createdAt || apiTxn.date,
    type: apiTxn.type,
    description: apiTxn.description,
    amount: apiTxn.amount,
    balance: apiTxn.balanceAfter || apiTxn.balance,
  };
};

const defaultWallet: WalletData = {
  lucreBalance: 0,
  activeBalance: 500,
  discretionaryBalance: 500,
  totalEarned: 500,
  lastPayout: new Date().toISOString(),
  expenses: {
    tax: 0,
    rent: 0,
    food: 0,
    utilities: 0,
    other: 0,
  },
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState<WalletData>(defaultWallet);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshWallet = async () => {
    try {
      const response = await walletApi.getWallet();
      if (response.success && response.data) {
        setWallet(normalizeWallet(response.data.wallet));
        setTransactions(response.data.transactions.map(normalizeTransaction));
      }
    } catch (error: any) {
      console.error('Failed to fetch wallet:', error.message);
      // Don't show error toast on initial load
      if (!loading) {
        toast.error('Failed to load wallet data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWallet();
  }, []);

  const addToLucre = async (amount: number, description: string): Promise<void> => {
    try {
      const response = await walletApi.earn(amount, description);
      if (response.success && response.data) {
        setWallet(normalizeWallet(response.data));
        await refreshWallet(); // Refresh to get updated transactions
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add lucre');
      throw error;
    }
  };

  const deductFromDiscretionary = async (amount: number, description: string): Promise<boolean> => {
    try {
      const response = await walletApi.deductDiscretionary(amount, description);
      if (response.success && response.data) {
        setWallet(normalizeWallet(response.data));
        await refreshWallet();
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || 'Insufficient balance!');
      return false;
    }
  };

  const addToDiscretionary = async (amount: number, description: string): Promise<void> => {
    try {
      const response = await walletApi.addDiscretionary(amount, description);
      if (response.success && response.data) {
        setWallet(normalizeWallet(response.data));
        await refreshWallet();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add funds');
      throw error;
    }
  };

  const processWeeklyPayout = async (): Promise<void> => {
    try {
      const response = await walletApi.payout();
      if (response.success && response.data) {
        setWallet(normalizeWallet(response.data));
        await refreshWallet();
        toast.success(`💰 Salary Received!`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to process payout');
      throw error;
    }
  };

  const allocateExpenses = async (expenses: WalletData['expenses']): Promise<void> => {
    try {
      const response = await walletApi.updateExpenses(expenses);
      if (response.success && response.data) {
        setWallet(normalizeWallet(response.data));
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update expenses');
      throw error;
    }
  };

  return (
    <WalletContext.Provider value={{
      wallet,
      transactions,
      addToLucre,
      deductFromDiscretionary,
      addToDiscretionary,
      processWeeklyPayout,
      allocateExpenses,
      loading,
      refreshWallet,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
};
