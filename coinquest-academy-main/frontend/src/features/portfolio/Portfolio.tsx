/** @format */

import { useStocks } from "../stocks/StockContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--danger))",
];

export default function Portfolio() {
  const { stocks, holdings, trades, getPortfolioValue, getTotalProfit } =
    useStocks();

  const portfolioValue = getPortfolioValue();
  const totalProfit = getTotalProfit();
  const totalInvested = holdings.reduce(
    (sum, h) => sum + h.avgCost * h.shares,
    0
  );
  const profitPercent =
    totalInvested > 0
      ? ((totalProfit / totalInvested) * 100).toFixed(2)
      : "0.00";

  const holdingsWithDetails = holdings.map((holding) => {
    const stock = stocks.find((s) => s.symbol === holding.symbol);
    const currentValue = stock ? stock.price * holding.shares : 0;
    const costBasis = holding.avgCost * holding.shares;
    const profit = currentValue - costBasis;
    const profitPercent =
      costBasis > 0 ? ((profit / costBasis) * 100).toFixed(2) : "0.00";

    return {
      ...holding,
      stock,
      currentValue,
      costBasis,
      profit,
      profitPercent,
    };
  });

  const bestPerformer = holdingsWithDetails.reduce(
    (best, current) =>
      parseFloat(current.profitPercent) > parseFloat(best.profitPercent)
        ? current
        : best,
    holdingsWithDetails[0]
  );

  const worstPerformer = holdingsWithDetails.reduce(
    (worst, current) =>
      parseFloat(current.profitPercent) < parseFloat(worst.profitPercent)
        ? current
        : worst,
    holdingsWithDetails[0]
  );

  const pieData = holdingsWithDetails.map((h) => ({
    name: h.symbol,
    value: h.currentValue,
  }));

  // Generate portfolio history (last 30 days simulated)
  const portfolioHistory = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: Math.round(
      portfolioValue * (0.85 + i * 0.005 + Math.random() * 0.05)
    ),
  }));

  const getInsights = () => {
    const insights = [];
    if (holdings.length >= 3) {
      insights.push("✓ Your portfolio is well diversified!");
    } else if (holdings.length > 0) {
      insights.push("Consider diversifying by investing in more companies");
    }

    if (totalProfit > 0) {
      insights.push(
        `Great job! You've earned ₹${totalProfit.toFixed(2)} in profits!`
      );
    }

    const losingStocks = holdingsWithDetails.filter(
      (h) => parseFloat(h.profitPercent) < -5
    );
    if (losingStocks.length > 0) {
      insights.push(
        `Consider reviewing ${losingStocks
          .map((s) => s.symbol)
          .join(", ")} - down more than 5%`
      );
    }

    return insights;
  };

  if (holdings.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">My Portfolio</h1>
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold mb-2">No Holdings Yet</h2>
          <p className="text-muted-foreground mb-6">
            Start building your portfolio by buying your first stock!
          </p>
          <Button asChild size="lg">
            <Link to="/stocks">Browse Stocks</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">My Portfolio</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Investment</p>
          <p className="text-3xl font-bold">₹{totalInvested.toFixed(2)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Current Value</p>
          <p className="text-3xl font-bold">₹{portfolioValue.toFixed(2)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">
            Total Profit/Loss
          </p>
          <div className="flex items-center gap-2">
            <p
              className={`text-3xl font-bold ${
                totalProfit >= 0 ? "text-success" : "text-danger"
              }`}
            >
              ₹{Math.abs(totalProfit).toFixed(2)}
            </p>
            {totalProfit >= 0 ? (
              <TrendingUp className="text-success" />
            ) : (
              <TrendingDown className="text-danger" />
            )}
          </div>
          <p
            className={`text-sm ${
              totalProfit >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {totalProfit >= 0 ? "+" : "-"}
            {Math.abs(parseFloat(profitPercent))}%
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Best Performer</p>
          {bestPerformer && (
            <>
              <p className="text-2xl font-bold">{bestPerformer.symbol}</p>
              <p className="text-sm text-success">
                +{bestPerformer.profitPercent}%
              </p>
            </>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Portfolio Allocation
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Portfolio Value (30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={portfolioHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Holdings</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Company</th>
                <th className="text-right py-3 px-2">Symbol</th>
                <th className="text-right py-3 px-2">Shares</th>
                <th className="text-right py-3 px-2">Avg Cost</th>
                <th className="text-right py-3 px-2">Current</th>
                <th className="text-right py-3 px-2">Value</th>
                <th className="text-right py-3 px-2">P/L</th>
                <th className="text-right py-3 px-2">%</th>
                <th className="text-right py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdingsWithDetails.map((holding) => (
                <tr key={holding.symbol} className="border-b hover:bg-muted/50">
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{holding.stock?.icon}</span>
                      <span className="font-medium">{holding.stock?.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-4 px-2 font-mono">
                    {holding.symbol}
                  </td>
                  <td className="text-right py-4 px-2">{holding.shares}</td>
                  <td className="text-right py-4 px-2">
                    ₹{holding.avgCost.toFixed(2)}
                  </td>
                  <td className="text-right py-4 px-2">
                    ₹{holding.stock?.price.toFixed(2)}
                  </td>
                  <td className="text-right py-4 px-2 font-bold">
                    ₹{holding.currentValue.toFixed(2)}
                  </td>
                  <td
                    className={`text-right py-4 px-2 font-bold ${
                      holding.profit >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {holding.profit >= 0 ? "+" : "-"}₹
                    {Math.abs(holding.profit).toFixed(2)}
                  </td>
                  <td
                    className={`text-right py-4 px-2 ${
                      parseFloat(holding.profitPercent) >= 0
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {parseFloat(holding.profitPercent) >= 0 ? "+" : ""}
                    {holding.profitPercent}%
                  </td>
                  <td className="text-right py-4 px-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/stocks/${holding.symbol}`}>Trade</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Portfolio Insights</h2>
        <div className="space-y-2">
          {getInsights().map((insight, i) => (
            <p key={i} className="text-sm">
              {insight}
            </p>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Recent Trades</h2>
        <div className="space-y-2">
          {trades.slice(0, 10).map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium">
                  {trade.type === "buy" ? "🟢 Bought" : "🔴 Sold"}{" "}
                  {trade.shares} {trade.symbol}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(trade.date).toLocaleDateString()} at ₹
                  {trade.price.toFixed(2)}/share
                </p>
              </div>
              <p className="font-bold">
                {trade.type === "buy" ? "-" : "+"}₹
                {(trade.shares * trade.price).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
