import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

interface WalletData {
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

interface Transaction {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: number;
  balance: number;
}

interface WalletContextType {
  wallet: WalletData;
  transactions: Transaction[];
  addToLucre: (amount: number, description: string) => void;
  deductFromDiscretionary: (amount: number, description: string) => boolean;
  addToDiscretionary: (amount: number, description: string) => void;
  processWeeklyPayout: () => void;
  allocateExpenses: (expenses: WalletData['expenses']) => void;
}

const defaultWallet: WalletData = {
  lucreBalance: 0,
  activeBalance: 500, // Starting balance
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

  useEffect(() => {
    const storedWallet = localStorage.getItem('wallet');
    const storedTransactions = localStorage.getItem('transactions');
    
    if (storedWallet) setWallet(JSON.parse(storedWallet));
    if (storedTransactions) setTransactions(JSON.parse(storedTransactions));

    // Check for weekly payout
    checkWeeklyPayout();
  }, []);

  const checkWeeklyPayout = () => {
    const storedWallet = JSON.parse(localStorage.getItem('wallet') || JSON.stringify(defaultWallet));
    const lastPayout = new Date(storedWallet.lastPayout);
    const now = new Date();
    
    // Check if it's Monday and at least 7 days since last payout
    const daysSinceLastPayout = Math.floor((now.getTime() - lastPayout.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastPayout >= 7) {
      processWeeklyPayout();
    }
  };

  const addTransaction = (type: string, description: string, amount: number) => {
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      date: new Date().toISOString(),
      type,
      description,
      amount,
      balance: wallet.discretionaryBalance + (amount > 0 ? amount : 0),
    };
    
    const updatedTransactions = [newTransaction, ...transactions].slice(0, 50);
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  };

  const addToLucre = (amount: number, description: string) => {
    const updatedWallet = {
      ...wallet,
      lucreBalance: wallet.lucreBalance + amount,
      totalEarned: wallet.totalEarned + amount,
    };
    setWallet(updatedWallet);
    localStorage.setItem('wallet', JSON.stringify(updatedWallet));
    addTransaction('earning', description, amount);
  };

  const deductFromDiscretionary = (amount: number, description: string): boolean => {
    if (wallet.discretionaryBalance >= amount) {
      const updatedWallet = {
        ...wallet,
        discretionaryBalance: wallet.discretionaryBalance - amount,
      };
      setWallet(updatedWallet);
      localStorage.setItem('wallet', JSON.stringify(updatedWallet));
      addTransaction('expense', description, -amount);
      return true;
    }
    toast.error('Insufficient balance!');
    return false;
  };

  const addToDiscretionary = (amount: number, description: string) => {
    const updatedWallet = {
      ...wallet,
      discretionaryBalance: wallet.discretionaryBalance + amount,
    };
    setWallet(updatedWallet);
    localStorage.setItem('wallet', JSON.stringify(updatedWallet));
    addTransaction('income', description, amount);
  };

  const processWeeklyPayout = () => {
    if (wallet.lucreBalance > 0) {
      const payoutAmount = wallet.lucreBalance;
      const updatedWallet = {
        ...wallet,
        lucreBalance: 0,
        activeBalance: wallet.activeBalance + payoutAmount,
        discretionaryBalance: wallet.activeBalance + payoutAmount,
        lastPayout: new Date().toISOString(),
      };
      setWallet(updatedWallet);
      localStorage.setItem('wallet', JSON.stringify(updatedWallet));
      toast.success(`💰 Salary Received! ₹${payoutAmount}`);
    }
  };

  const allocateExpenses = (expenses: WalletData['expenses']) => {
    const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + val, 0);
    const updatedWallet = {
      ...wallet,
      expenses,
      discretionaryBalance: wallet.activeBalance - totalExpenses,
    };
    setWallet(updatedWallet);
    localStorage.setItem('wallet', JSON.stringify(updatedWallet));
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
