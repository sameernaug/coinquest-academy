/** @format */

import { useState } from "react";
import { useStocks } from "./StockContext";
import DashboardLayout from "@/shared/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

const Stocks = () => {
  const { stocks, holdings, getPortfolioValue, getTotalProfit } = useStocks();

  const portfolioValue = getPortfolioValue();
  const totalProfit = getTotalProfit();
  const profitPercent =
    holdings.length > 0
      ? (totalProfit / (portfolioValue - totalProfit)) * 100
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Stock Market 📈</h1>
          <p className="text-muted-foreground">
            Trade virtual stocks and practice investing
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6">
            <h3 className="text-sm text-muted-foreground mb-1">
              Portfolio Value
            </h3>
            <p className="text-3xl font-bold">₹{portfolioValue.toFixed(2)}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm text-muted-foreground mb-1">
              Total Profit/Loss
            </h3>
            <p
              className={`text-3xl font-bold ${
                totalProfit >= 0 ? "text-profit" : "text-loss"
              }`}
            >
              {totalProfit >= 0 ? "+" : ""}₹{totalProfit.toFixed(2)}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm text-muted-foreground mb-1">Return</h3>
            <p
              className={`text-3xl font-bold ${
                profitPercent >= 0 ? "text-profit" : "text-loss"
              }`}
            >
              {profitPercent >= 0 ? "+" : ""}
              {profitPercent.toFixed(2)}%
            </p>
          </Card>
        </div>

        {/* Market Ticker */}
        <Card className="p-4 bg-muted overflow-hidden">
          <div className="flex gap-6 animate-marquee whitespace-nowrap">
            {stocks.map((stock) => (
              <div
                key={stock.symbol}
                className="inline-flex items-center gap-2"
              >
                <span className="font-bold">{stock.symbol}:</span>
                <span>₹{stock.price.toFixed(2)}</span>
                <span
                  className={stock.change >= 0 ? "text-profit" : "text-loss"}
                >
                  {stock.change >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(stock.changePercent).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Company Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stocks.map((stock) => (
            <Card key={stock.symbol} className="p-6 hover-lift cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{stock.icon}</div>
                  <div>
                    <h3 className="font-bold">{stock.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {stock.symbol}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-3xl font-bold mb-1">
                  ₹{stock.price.toFixed(2)}
                </p>
                <p
                  className={`text-sm font-medium flex items-center gap-1 ${
                    stock.change >= 0 ? "text-profit" : "text-loss"
                  }`}
                >
                  {stock.change >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {stock.change >= 0 ? "+" : ""}₹{stock.change.toFixed(2)} (
                  {stock.changePercent.toFixed(2)}%)
                </p>
              </div>

              {/* Mini Chart */}
              <div className="h-16 mb-4">
                <svg width="100%" height="100%" className="overflow-visible">
                  <polyline
                    fill="none"
                    stroke={
                      stock.change >= 0
                        ? "hsl(var(--profit))"
                        : "hsl(var(--loss))"
                    }
                    strokeWidth="2"
                    points={stock.history
                      .map((price, i) => {
                        const x = (i / (stock.history.length - 1)) * 100;
                        const min = Math.min(...stock.history);
                        const max = Math.max(...stock.history);
                        const y = 100 - ((price - min) / (max - min || 1)) * 80;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                  />
                </svg>
              </div>

              <Link to={`/stocks/${stock.symbol}`}>
                <Button className="w-full" variant="outline">
                  View Details <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        {/* My Portfolio Link */}
        {holdings.length > 0 && (
          <Card className="p-6 bg-primary/10 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Your Portfolio</h3>
                <p className="text-sm text-muted-foreground">
                  You own {holdings.length}{" "}
                  {holdings.length === 1 ? "stock" : "stocks"}
                </p>
              </div>
              <Link to="/portfolio">
                <Button className="bg-primary hover:bg-primary/90">
                  View Portfolio <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Stocks;
