/** @format */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { useAuth } from "../auth/AuthContext";
import { useWallet } from "../wallet/WalletContext";

interface QuizScore {
  score: number;
  total: number;
  date: string;
  timeSpent: number;
}

interface Achievement {
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

interface ProgressData {
  currentModule: number;
  completedModules: number[];
  completedLessons: string[];
  quizScores: Record<string, QuizScore>;
  achievements: Achievement[];
}

interface ProgressContextType {
  progress: ProgressData;
  completeLesson: (moduleId: number, lessonId: string) => void;
  completeQuiz: (
    quizId: string,
    score: number,
    total: number,
    timeSpent: number
  ) => void;
  checkAchievements: () => void;
  getModuleProgress: (moduleId: number) => number;
  isLessonUnlocked: (moduleId: number, lessonId: string) => boolean;
}

const defaultAchievements: Achievement[] = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your first lesson",
    icon: "🎖️",
    xpReward: 50,
    unlocked: false,
  },
  {
    id: "quiz-master",
    name: "Quiz Master",
    description: "Pass 5 quizzes with 80%+",
    icon: "🧠",
    xpReward: 100,
    unlocked: false,
    progress: 0,
    total: 5,
  },
  {
    id: "early-investor",
    name: "Early Investor",
    description: "Buy your first stock",
    icon: "📈",
    xpReward: 75,
    unlocked: false,
  },
  {
    id: "streak-warrior",
    name: "Streak Warrior",
    description: "7-day login streak",
    icon: "🔥",
    xpReward: 150,
    unlocked: false,
  },
  {
    id: "money-master",
    name: "Money Master",
    description: "Complete all beginner modules",
    icon: "💰",
    xpReward: 200,
    unlocked: false,
    progress: 0,
    total: 5,
  },
  {
    id: "diversification-pro",
    name: "Diversification Pro",
    description: "Own shares in all 5 companies",
    icon: "📊",
    xpReward: 250,
    unlocked: false,
    progress: 0,
    total: 5,
  },
  {
    id: "quiz-champion",
    name: "Quiz Champion",
    description: "Score 100% on 10 quizzes",
    icon: "🏆",
    xpReward: 300,
    unlocked: false,
    progress: 0,
    total: 10,
  },
  {
    id: "trading-tycoon",
    name: "Trading Tycoon",
    description: "Make ₹1000 profit from stocks",
    icon: "💼",
    xpReward: 500,
    unlocked: false,
    progress: 0,
    total: 1000,
  },
  {
    id: "battle-victor",
    name: "Battle Victor",
    description: "Win 10 quiz battles",
    icon: "⚔️",
    xpReward: 200,
    unlocked: false,
    progress: 0,
    total: 10,
  },
];

const ProgressContext = createContext<ProgressContextType | undefined>(
  undefined
);

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const { addXP } = useAuth();
  const { addToLucre } = useWallet();
  const [progress, setProgress] = useState<ProgressData>({
    currentModule: 1,
    completedModules: [],
    completedLessons: [],
    quizScores: {},
    achievements: defaultAchievements,
  });

  useEffect(() => {
    const storedProgress = localStorage.getItem("progress");
    if (storedProgress) {
      const parsed = JSON.parse(storedProgress);
      setProgress({
        ...parsed,
        achievements: defaultAchievements.map((def) => {
          const stored = parsed.achievements?.find(
            (a: Achievement) => a.id === def.id
          );
          return stored || def;
        }),
      });
    }
  }, []);

  const saveProgress = (newProgress: ProgressData) => {
    setProgress(newProgress);
    localStorage.setItem("progress", JSON.stringify(newProgress));
  };

  const completeLesson = (moduleId: number, lessonId: string) => {
    const lessonKey = `${moduleId}.${lessonId}`;
    if (!progress.completedLessons.includes(lessonKey)) {
      const updatedProgress = {
        ...progress,
        completedLessons: [...progress.completedLessons, lessonKey],
      };
      saveProgress(updatedProgress);
      addXP(50);
      addToLucre(30, `Completed Lesson ${lessonKey}`);
      toast.success("Lesson complete! +50 XP, +₹30");

      // Check for first lesson achievement
      if (updatedProgress.completedLessons.length === 1) {
        unlockAchievement("first-steps");
      }
    }
  };

  const completeQuiz = (
    quizId: string,
    score: number,
    total: number,
    timeSpent: number
  ) => {
    const percentage = (score / total) * 100;
    const xpEarned = score * 10;
    const moneyEarned = Math.floor(percentage);

    const updatedProgress = {
      ...progress,
      quizScores: {
        ...progress.quizScores,
        [quizId]: { score, total, date: new Date().toISOString(), timeSpent },
      },
    };

    // Check if module quiz completed
    const moduleId = parseInt(quizId.split("-")[1]);
    if (percentage >= 70 && !progress.completedModules.includes(moduleId)) {
      updatedProgress.completedModules = [
        ...progress.completedModules,
        moduleId,
      ];
      updatedProgress.currentModule = moduleId + 1;
    }

    saveProgress(updatedProgress);
    addXP(xpEarned);
    addToLucre(moneyEarned, `Quiz ${quizId}: ${score}/${total}`);

    setTimeout(() => checkAchievements(), 500);
  };

  const unlockAchievement = (achievementId: string) => {
    const achievement = progress.achievements.find(
      (a) => a.id === achievementId
    );
    if (achievement && !achievement.unlocked) {
      const updatedAchievements = progress.achievements.map((a) =>
        a.id === achievementId
          ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
          : a
      );

      saveProgress({ ...progress, achievements: updatedAchievements });
      addXP(achievement.xpReward);
      toast.success(
        `🎉 Achievement Unlocked: ${achievement.name}! +${achievement.xpReward} XP`,
        {
          duration: 5000,
        }
      );
    }
  };

  const checkAchievements = () => {
    // Quiz Master: 5 quizzes with 80%+
    const goodQuizzes = Object.values(progress.quizScores).filter(
      (q) => q.score / q.total >= 0.8
    ).length;
    if (goodQuizzes >= 5) unlockAchievement("quiz-master");

    // Quiz Champion: 10 perfect quizzes
    const perfectQuizzes = Object.values(progress.quizScores).filter(
      (q) => q.score === q.total
    ).length;
    if (perfectQuizzes >= 10) unlockAchievement("quiz-champion");

    // Money Master: All 5 modules complete
    if (progress.completedModules.length >= 5)
      unlockAchievement("money-master");

    // Check stock-related achievements (will be triggered from StockContext)
    const portfolio = JSON.parse(
      localStorage.getItem("portfolio") || '{"holdings":[]}'
    );
    if (portfolio.holdings?.length > 0) unlockAchievement("early-investor");
    if (portfolio.holdings?.length >= 5)
      unlockAchievement("diversification-pro");
  };

  const getModuleProgress = (moduleId: number): number => {
    const moduleLessons = progress.completedLessons.filter((l) =>
      l.startsWith(`${moduleId}.`)
    );
    return (moduleLessons.length / 3) * 100; // 3 lessons per module
  };

  const isLessonUnlocked = (moduleId: number, lessonId: string): boolean => {
    if (moduleId === 1 && lessonId === "1") return true;

    const previousLesson = parseInt(lessonId) - 1;
    if (previousLesson > 0) {
      return progress.completedLessons.includes(
        `${moduleId}.${previousLesson}`
      );
    }

    return progress.completedModules.includes(moduleId - 1);
  };

  return (
    <ProgressContext.Provider
      value={{
        progress,
        completeLesson,
        completeQuiz,
        checkAchievements,
        getModuleProgress,
        isLessonUnlocked,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context)
    throw new Error("useProgress must be used within ProgressProvider");
  return context;
};
