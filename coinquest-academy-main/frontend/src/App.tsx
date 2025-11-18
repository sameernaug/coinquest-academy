/** @format */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./features/auth/AuthContext";
import { WalletProvider } from "./features/wallet/WalletContext";
import { StockProvider } from "./features/stocks/StockContext";
import { ProgressProvider } from "./features/learning/ProgressContext";
import Landing from "./features/auth/Landing";
import Signup from "./features/auth/Signup";
import Login from "./features/auth/Login";
import Dashboard from "./features/dashboard/Dashboard";
import Wallet from "./features/wallet/Wallet";
import Stocks from "./features/stocks/Stocks";
import StockDetail from "./features/stocks/StockDetail";
import Learning from "./features/learning/Learning";
import Lesson from "./features/learning/Lesson";
import Quiz from "./features/learning/Quiz";
import Achievements from "./features/achievements/Achievements";
import Leaderboard from "./features/leaderboard/Leaderboard";
import Battles from "./features/battles/Battles";
import Tools from "./features/tools/Tools";
import Portfolio from "./features/portfolio/Portfolio";
import Settings from "./features/settings/Settings";
import NotFound from "./shared/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="coinquest-theme">
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <WalletProvider>
              <StockProvider>
                <ProgressProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/wallet"
                      element={
                        <ProtectedRoute>
                          <Wallet />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/stocks"
                      element={
                        <ProtectedRoute>
                          <Stocks />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/stocks/:symbol"
                      element={
                        <ProtectedRoute>
                          <StockDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/learning"
                      element={
                        <ProtectedRoute>
                          <Learning />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/lesson/:moduleId/:lessonId"
                      element={
                        <ProtectedRoute>
                          <Lesson />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/quiz/:moduleId"
                      element={
                        <ProtectedRoute>
                          <Quiz />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/achievements"
                      element={
                        <ProtectedRoute>
                          <Achievements />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/leaderboard"
                      element={
                        <ProtectedRoute>
                          <Leaderboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/battles"
                      element={
                        <ProtectedRoute>
                          <Battles />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/tools"
                      element={
                        <ProtectedRoute>
                          <Tools />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/portfolio"
                      element={
                        <ProtectedRoute>
                          <Portfolio />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ProgressProvider>
              </StockProvider>
            </WalletProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
