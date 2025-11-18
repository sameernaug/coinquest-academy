/** @format */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { useWallet } from "../wallet/WalletContext";

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  history: number[];
  icon: string;
  description: string;
  sector: string;
}

interface Holding {
  symbol: string;
  shares: number;
  avgCost: number;
}

interface Trade {
  id: string;
  date: string;
  symbol: string;
  type: "buy" | "sell";
  shares: number;
  price: number;
}

interface StockContextType {
  stocks: Stock[];
  holdings: Holding[];
  trades: Trade[];
  buyStock: (symbol: string, shares: number) => boolean;
  sellStock: (symbol: string, shares: number) => boolean;
  getHolding: (symbol: string) => Holding | undefined;
  getPortfolioValue: () => number;
  getTotalProfit: () => number;
}

const initialStocks: Stock[] = [
  {
    symbol: "PNCL",
    name: "PencilCorp",
    price: 45.5,
    change: 1.2,
    changePercent: 2.71,
    history: [44, 44.5, 45, 45.5],
    icon: "📝",
    description: "Leading manufacturer of eco-friendly writing instruments",
    sector: "Stationery & Supplies",
  },
  {
    symbol: "SNCK",
    name: "SnackHub",
    price: 118.3,
    change: -1.4,
    changePercent: -1.17,
    history: [120, 119, 118.5, 118.3],
    icon: "🍿",
    description: "Premium snacks and refreshments for students",
    sector: "Food & Beverage",
  },
  {
    symbol: "STDY",
    name: "StudyTech",
    price: 92.0,
    change: 5.0,
    changePercent: 5.75,
    history: [87, 89, 90, 92],
    icon: "💻",
    description: "Educational technology and learning platforms",
    sector: "EdTech",
  },
  {
    symbol: "BOOK",
    name: "BookNest",
    price: 67.8,
    change: 0.5,
    changePercent: 0.74,
    history: [67, 67.3, 67.5, 67.8],
    icon: "📚",
    description: "Online bookstore and learning materials",
    sector: "Retail",
  },
  {
    symbol: "CAMP",
    name: "CampusConnect",
    price: 155.2,
    change: -3.1,
    changePercent: -1.96,
    history: [158, 156.5, 155.5, 155.2],
    icon: "🎓",
    description: "Student networking and collaboration platform",
    sector: "Social Tech",
  },
];

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider = ({ children }: { children: ReactNode }) => {
  const [stocks, setStocks] = useState<Stock[]>(initialStocks);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const { deductFromDiscretionary, addToDiscretionary } = useWallet();

  useEffect(() => {
    const storedHoldings = localStorage.getItem("portfolio");
    const storedTrades = localStorage.getItem("trades");
    const storedStocks = localStorage.getItem("stockPrices");

    if (storedHoldings) {
      const data = JSON.parse(storedHoldings);
      setHoldings(data.holdings || []);
    }
    if (storedTrades) {
      const data = JSON.parse(storedTrades);
      setTrades(data || []);
    }
    if (storedStocks) {
      setStocks(JSON.parse(storedStocks));
    }

    // Start price simulation
    const interval = setInterval(() => {
      updateStockPrices();
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const updateStockPrices = () => {
    setStocks((prevStocks) => {
      const updated = prevStocks.map((stock) => {
        const changePercent = Math.random() * 0.08 - 0.03; // -3% to +5%
        const newPrice = parseFloat(
          (stock.price * (1 + changePercent)).toFixed(2)
        );
        const change = parseFloat((newPrice - stock.price).toFixed(2));

        return {
          ...stock,
          price: newPrice,
          change,
          changePercent: parseFloat((changePercent * 100).toFixed(2)),
          history: [...stock.history.slice(-49), newPrice],
        };
      });

      localStorage.setItem("stockPrices", JSON.stringify(updated));
      return updated;
    });
  };

  const buyStock = (symbol: string, shares: number): boolean => {
    const stock = stocks.find((s) => s.symbol === symbol);
    if (!stock) return false;

    const cost = stock.price * shares;
    if (deductFromDiscretionary(cost, `Bought ${shares} ${symbol} shares`)) {
      const existingHolding = holdings.find((h) => h.symbol === symbol);

      let updatedHoldings: Holding[];
      if (existingHolding) {
        const totalShares = existingHolding.shares + shares;
        const newAvgCost =
          (existingHolding.avgCost * existingHolding.shares + cost) /
          totalShares;
        updatedHoldings = holdings.map((h) =>
          h.symbol === symbol
            ? {
                ...h,
                shares: totalShares,
                avgCost: parseFloat(newAvgCost.toFixed(2)),
              }
            : h
        );
      } else {
        updatedHoldings = [
          ...holdings,
          { symbol, shares, avgCost: stock.price },
        ];
      }

      const newTrade: Trade = {
        id: `trade_${Date.now()}`,
        date: new Date().toISOString(),
        symbol,
        type: "buy",
        shares,
        price: stock.price,
      };

      setHoldings(updatedHoldings);
      setTrades([newTrade, ...trades]);
      localStorage.setItem(
        "portfolio",
        JSON.stringify({ holdings: updatedHoldings })
      );
      localStorage.setItem("trades", JSON.stringify([newTrade, ...trades]));

      toast.success(
        `✓ Bought ${shares} ${symbol} shares for ₹${cost.toFixed(2)}!`
      );
      return true;
    }
    return false;
  };

  const sellStock = (symbol: string, shares: number): boolean => {
    const stock = stocks.find((s) => s.symbol === symbol);
    const holding = holdings.find((h) => h.symbol === symbol);

    if (!stock || !holding || holding.shares < shares) {
      toast.error("Insufficient shares to sell");
      return false;
    }

    const proceeds = stock.price * shares;
    addToDiscretionary(proceeds, `Sold ${shares} ${symbol} shares`);

    const updatedHoldings = holdings
      .map((h) =>
        h.symbol === symbol ? { ...h, shares: h.shares - shares } : h
      )
      .filter((h) => h.shares > 0);

    const newTrade: Trade = {
      id: `trade_${Date.now()}`,
      date: new Date().toISOString(),
      symbol,
      type: "sell",
      shares,
      price: stock.price,
    };

    setHoldings(updatedHoldings);
    setTrades([newTrade, ...trades]);
    localStorage.setItem(
      "portfolio",
      JSON.stringify({ holdings: updatedHoldings })
    );
    localStorage.setItem("trades", JSON.stringify([newTrade, ...trades]));

    const profit = (stock.price - holding.avgCost) * shares;
    toast.success(
      `✓ Sold ${shares} ${symbol} shares for ₹${proceeds.toFixed(2)}! ${
        profit > 0 ? `Profit: ₹${profit.toFixed(2)}` : ""
      }`
    );
    return true;
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
