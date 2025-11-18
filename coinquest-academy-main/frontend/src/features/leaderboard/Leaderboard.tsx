/** @format */

import { useAuth } from "../auth/AuthContext";
import DashboardLayout from "@/shared/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

// Generate fake leaderboard data
const generateLeaderboard = () => {
  const names = [
    "Priya Sharma",
    "Arjun Patel",
    "Sneha Reddy",
    "Rahul Kumar",
    "Ananya Singh",
    "Rohan Gupta",
    "Diya Mehta",
    "Aditya Verma",
    "Isha Joshi",
    "Karan Malhotra",
    "Sanya Kapoor",
    "Vivaan Shah",
    "Aarav Desai",
    "Myra Agarwal",
    "Dev Sharma",
  ];
  const schools = [
    "Delhi Public School",
    "Ryan International",
    "DAV Public School",
    "Modern School",
    "St. Xavier's",
    "Kendriya Vidyalaya",
    "Bal Bharati",
    "Mount Carmel",
  ];

  return names
    .map((name, i) => ({
      rank: i + 1,
      name,
      level: Math.floor(Math.random() * 10) + 5,
      xp: Math.floor(Math.random() * 3000) + 500,
      school: schools[Math.floor(Math.random() * schools.length)],
      streak: Math.floor(Math.random() * 50) + 1,
      profit: Math.floor(Math.random() * 3000),
    }))
    .sort((a, b) => b.xp - a.xp);
};

const Leaderboard = () => {
  const { user } = useAuth();
  const leaderboard = generateLeaderboard();

  // Add user to leaderboard
  const userRank = {
    rank: 47,
    name: user?.name || "You",
    level: user?.level || 1,
    xp: user?.xp || 0,
    school: user?.school || "Your School",
    streak: user?.currentStreak || 1,
    profit: 200,
  };

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3, 15);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Leaderboard 🏆</h1>
          <p className="text-muted-foreground">
            Compete with students worldwide
          </p>
        </div>

        {/* Your Stats */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <h3 className="text-lg font-semibold mb-4">Your Ranking</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Your Rank</p>
              <p className="text-2xl font-bold">#{userRank.rank}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">XP</p>
              <p className="text-2xl font-bold">{userRank.xp}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Streak</p>
              <p className="text-2xl font-bold">🔥 {userRank.streak}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stock Profit</p>
              <p className="text-2xl font-bold text-profit">
                +₹{userRank.profit}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            You're in the top 10% of learners! Keep it up! 💪
          </p>
        </Card>

        {/* Top 3 Podium */}
        <div className="grid md:grid-cols-3 gap-4">
          {[top3[1], top3[0], top3[2]].map((user, i) => {
            const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
            const heights = ["h-48", "h-56", "h-40"];
            const medals = ["🥈", "🥇", "🥥"];

            if (!user) return null;

            return (
              <Card
                key={user.rank}
                className={`p-6 ${heights[i]} flex flex-col justify-end hover-lift animate-slide-up`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="text-center">
                  <div className="text-5xl mb-2">{medals[i]}</div>
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                    {user.name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{user.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {user.school}
                  </p>
                  <div className="flex justify-center gap-4 text-sm">
                    <span className="font-semibold">L{user.level}</span>
                    <span>{user.xp} XP</span>
                    <span>🔥 {user.streak}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Rest of Leaderboard */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Learners</h3>
          <div className="space-y-2">
            {rest.map((user) => (
              <div
                key={user.rank}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-8 text-center font-bold text-muted-foreground">
                  #{user.rank}
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center text-white text-lg font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.school}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Level </span>
                    <span className="font-bold">{user.level}</span>
                  </div>
                  <div>
                    <span className="font-bold">{user.xp}</span>
                    <span className="text-muted-foreground"> XP</span>
                  </div>
                  <div>
                    <span>🔥</span>
                    <span className="font-bold ml-1">{user.streak}</span>
                  </div>
                  <div className="text-profit font-bold">+₹{user.profit}</div>
                </div>
              </div>
            ))}

            {/* User Row */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/10 border-2 border-primary/20">
              <div className="w-8 text-center font-bold">#{userRank.rank}</div>
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white text-lg font-bold">
                {userRank.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{userRank.name} (YOU)</p>
                <p className="text-sm text-muted-foreground">
                  {userRank.school}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Level </span>
                  <span className="font-bold">{userRank.level}</span>
                </div>
                <div>
                  <span className="font-bold">{userRank.xp}</span>
                  <span className="text-muted-foreground"> XP</span>
                </div>
                <div>
                  <span>🔥</span>
                  <span className="font-bold ml-1">{userRank.streak}</span>
                </div>
                <div className="text-profit font-bold">+₹{userRank.profit}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;
