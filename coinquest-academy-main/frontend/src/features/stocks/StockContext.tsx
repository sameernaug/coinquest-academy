/** @format */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { stocksApi, Stock, Holding, Trade, Portfolio } from "@/lib/api-client";

interface StockContextType {
  stocks: Stock[];
  holdings: Holding[];
  trades: Trade[];
  buyStock: (symbol: string, shares: number) => Promise<boolean>;
  sellStock: (symbol: string, shares: number) => Promise<boolean>;
  getHolding: (symbol: string) => Holding | undefined;
  getPortfolioValue: () => number;
  getTotalProfit: () => number;
  loading: boolean;
  refreshStocks: () => Promise<void>;
  refreshPortfolio: () => Promise<void>;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider = ({ children }: { children: ReactNode }) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshStocks = async () => {
    try {
      const response = await stocksApi.getStocks();
      if (response.success && response.data) {
        setStocks(response.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch stocks:", error.message);
      if (!loading) {
        toast.error("Failed to load stocks");
      }
    }
  };

  const refreshPortfolio = async () => {
    try {
      const response = await stocksApi.getPortfolio();
      if (response.success && response.data) {
        setHoldings(response.data.holdings || []);
        setTrades(response.data.trades || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch portfolio:", error.message);
      if (!loading) {
        toast.error("Failed to load portfolio");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([refreshStocks(), refreshPortfolio()]);
    };
    loadData();

    // Refresh stock prices periodically
    const interval = setInterval(() => {
      refreshStocks();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const buyStock = async (symbol: string, shares: number): Promise<boolean> => {
    try {
      const response = await stocksApi.buyStock(symbol, shares);
      if (response.success && response.data) {
        setHoldings(response.data.holdings || []);
        setTrades(response.data.trades || []);
        const stock = stocks.find((s) => s.symbol === symbol);
        const cost = stock ? stock.price * shares : 0;
        toast.success(
          `✓ Bought ${shares} ${symbol} shares for ₹${cost.toFixed(2)}!`
        );
        await refreshPortfolio(); // Refresh to get updated wallet balance
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || "Failed to buy stock");
      return false;
    }
  };

  const sellStock = async (symbol: string, shares: number): Promise<boolean> => {
    try {
      const response = await stocksApi.sellStock(symbol, shares);
      if (response.success && response.data) {
        setHoldings(response.data.holdings || []);
        setTrades(response.data.trades || []);
        const stock = stocks.find((s) => s.symbol === symbol);
        const holding = holdings.find((h) => h.symbol === symbol);
        const proceeds = stock ? stock.price * shares : 0;
        const profit = holding && stock ? (stock.price - holding.avgCost) * shares : 0;
        toast.success(
          `✓ Sold ${shares} ${symbol} shares for ₹${proceeds.toFixed(2)}! ${
            profit > 0 ? `Profit: ₹${profit.toFixed(2)}` : ""
          }`
        );
        await refreshPortfolio(); // Refresh to get updated wallet balance
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || "Failed to sell stock");
      return false;
    }
  };

  const getHolding = (symbol: string) =>
    holdings.find((h) => h.symbol === symbol);

  const getPortfolioValue = () => {
    return holdings.reduce((total, holding) => {
      const stock = stocks.find((s) => s.symbol === holding.symbol);
      return total + (stock ? stock.price * holding.shares : 0);
    }, 0);
  };

  const getTotalProfit = () => {
    return holdings.reduce((total, holding) => {
      const stock = stocks.find((s) => s.symbol === holding.symbol);
      if (!stock) return total;
      const currentValue = stock.price * holding.shares;
      const costBasis = holding.avgCost * holding.shares;
      return total + (currentValue - costBasis);
    }, 0);
  };

  return (
    <StockContext.Provider
      value={{
        stocks,
        holdings,
        trades,
        buyStock,
        sellStock,
        getHolding,
        getPortfolioValue,
        getTotalProfit,
        loading,
        refreshStocks,
        refreshPortfolio,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStocks = () => {
  const context = useContext(StockContext);
  if (!context) throw new Error("useStocks must be used within StockProvider");
  return context;
};
