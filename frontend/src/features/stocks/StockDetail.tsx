/** @format */

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useStocks } from "./StockContext";
import { useWallet } from "../wallet/WalletContext";
import DashboardLayout from "@/shared/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Minus, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

const StockDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const { stocks, holdings, buyStock, sellStock, getHolding } = useStocks();
  const { wallet } = useWallet();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");

  const stock = stocks.find((s) => s.symbol === symbol);
  const holding = getHolding(symbol || "");

  if (!stock) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">Stock not found</p>
          <Link to="/stocks">
            <Button className="mt-4">Back to Market</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const totalCost = stock.price * quantity;
  const canAfford = wallet.discretionaryBalance >= totalCost;
  const canSell = holding && holding.shares >= quantity;

  const handleBuy = () => {
    if (buyStock(stock.symbol, quantity)) {
      setQuantity(1);
    }
  };

  const handleSell = () => {
    if (sellStock(stock.symbol, quantity)) {
      setQuantity(1);
    }
  };

  const profit = holding ? (stock.price - holding.avgCost) * quantity : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <Link to="/stocks">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Market
          </Button>
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="text-6xl">{stock.icon}</div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">{stock.name}</h1>
            <p className="text-lg text-muted-foreground mb-2">
              {stock.symbol} • {stock.sector}
            </p>
            <p className="text-muted-foreground">{stock.description}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Price Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8">
              <div className="flex items-end gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Current Price
                  </p>
                  <p className="text-5xl font-bold">
                    ₹{stock.price.toFixed(2)}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-2 text-lg font-medium pb-2 ${
                    stock.change >= 0 ? "text-profit" : "text-loss"
                  }`}
                >
                  {stock.change >= 0 ? (
                    <TrendingUp className="h-6 w-6" />
                  ) : (
                    <TrendingDown className="h-6 w-6" />
                  )}
                  {stock.change >= 0 ? "+" : ""}₹{stock.change.toFixed(2)} (
                  {stock.changePercent.toFixed(2)}%)
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Last updated: just now
              </p>
            </Card>

            {/* Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Price History</h3>
              <div className="h-64">
                <svg width="100%" height="100%" className="overflow-visible">
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={`${y}%`}
                      x2="100%"
                      y2={`${y}%`}
                      stroke="hsl(var(--border))"
                      strokeWidth="1"
                    />
                  ))}
                  {/* Price line */}
                  <polyline
                    fill="none"
                    stroke={
                      stock.change >= 0
                        ? "hsl(var(--profit))"
                        : "hsl(var(--loss))"
                    }
                    strokeWidth="3"
                    points={stock.history
                      .map((price, i) => {
                        const x = (i / (stock.history.length - 1)) * 100;
                        const min = Math.min(...stock.history);
                        const max = Math.max(...stock.history);
                        const y =
                          100 - ((price - min) / (max - min || 1)) * 80 - 10;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                  />
                </svg>
              </div>
            </Card>

            {/* Company Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Company Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Sector</p>
                  <p className="font-medium">{stock.sector}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="font-medium">
                    ₹{((stock.price * 100000) / 10000000).toFixed(2)} Cr
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">52W High</p>
                  <p className="font-medium">
                    ₹{(Math.max(...stock.history) * 1.15).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">52W Low</p>
                  <p className="font-medium">
                    ₹{(Math.min(...stock.history) * 0.85).toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
            <Card className="p-6 sticky top-6">
              <div className="flex gap-2 mb-6">
                <Button
                  className={`flex-1 ${
                    activeTab === "buy" ? "bg-primary" : ""
                  }`}
                  variant={activeTab === "buy" ? "default" : "outline"}
                  onClick={() => setActiveTab("buy")}
                >
                  Buy
                </Button>
                <Button
                  className={`flex-1 ${
                    activeTab === "sell"
                      ? "bg-destructive hover:bg-destructive/90"
                      : ""
                  }`}
                  variant={activeTab === "sell" ? "default" : "outline"}
                  onClick={() => setActiveTab("sell")}
                >
                  Sell
                </Button>
              </div>

              {activeTab === "buy" ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Quantity
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      At ₹{stock.price.toFixed(2)} per share
                    </p>
                  </div>

                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Cost:</span>
                      <span className="font-bold">₹{totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Your Balance:</span>
                      <span className="font-bold">
                        ₹{wallet.discretionaryBalance.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={handleBuy}
                    disabled={!canAfford}
                  >
                    {canAfford ? "Buy Shares" : "Insufficient Funds"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {holding ? (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          You own:{" "}
                          <span className="font-bold text-foreground">
                            {holding.shares} shares
                          </span>
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setQuantity(Math.max(1, quantity - 1))
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max={holding.shares}
                            value={quantity}
                            onChange={(e) =>
                              setQuantity(
                                Math.max(
                                  1,
                                  Math.min(
                                    holding.shares,
                                    parseInt(e.target.value) || 1
                                  )
                                )
                              )
                            }
                            className="text-center"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setQuantity(
                                Math.min(holding.shares, quantity + 1)
                              )
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Value:</span>
                          <span className="font-bold">
                            ₹{(stock.price * quantity).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Profit/Loss:</span>
                          <span
                            className={`font-bold ${
                              profit >= 0 ? "text-profit" : "text-loss"
                            }`}
                          >
                            {profit >= 0 ? "+" : ""}₹{profit.toFixed(2)} (
                            {(
                              (profit / (holding.avgCost * quantity)) *
                              100
                            ).toFixed(2)}
                            %)
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-destructive hover:bg-destructive/90"
                        onClick={handleSell}
                        disabled={!canSell}
                      >
                        Sell Shares
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        You don't own any shares of this stock
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Holdings Info */}
            {holding && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Your Holdings</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Shares Owned
                    </span>
                    <span className="font-bold">{holding.shares}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Avg Purchase Price
                    </span>
                    <span className="font-bold">
                      ₹{holding.avgCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Current Value
                    </span>
                    <span className="font-bold">
                      ₹{(stock.price * holding.shares).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <span className="text-sm text-muted-foreground">
                      Total Profit/Loss
                    </span>
                    <span
                      className={`font-bold ${
                        (stock.price - holding.avgCost) * holding.shares >= 0
                          ? "text-profit"
                          : "text-loss"
                      }`}
                    >
                      {(stock.price - holding.avgCost) * holding.shares >= 0
                        ? "+"
                        : ""}
                      ₹
                      {(
                        (stock.price - holding.avgCost) *
                        holding.shares
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StockDetail;
