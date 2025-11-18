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
import { learningApi, achievementsApi, Progress, Achievement, QuizScore } from "@/lib/api-client";

interface ProgressData {
  currentModule: number;
  completedModules: number[];
  completedLessons: string[];
  quizScores: Record<string, QuizScore>;
  achievements: Achievement[];
}

interface ProgressContextType {
  progress: ProgressData;
  completeLesson: (moduleId: number, lessonId: string) => Promise<void>;
  completeQuiz: (
    moduleId: number,
    answers: number[],
    timeSpent: number
  ) => Promise<void>;
  checkAchievements: () => Promise<void>;
  getModuleProgress: (moduleId: number) => number;
  isLessonUnlocked: (moduleId: number, lessonId: string) => boolean;
  loading: boolean;
  refreshProgress: () => Promise<void>;
  refreshAchievements: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(
  undefined
);

// Normalize progress from API
const normalizeProgress = (apiProgress: Progress): ProgressData => {
  return {
    currentModule: apiProgress.currentModule || 1,
    completedModules: apiProgress.completedModules || [],
    completedLessons: apiProgress.completedLessons || [],
    quizScores: apiProgress.quizScores || {},
    achievements: [], // Will be loaded separately
  };
};

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const { addXP } = useAuth();
  const { addToLucre } = useWallet();
  const [progress, setProgress] = useState<ProgressData>({
    currentModule: 1,
    completedModules: [],
    completedLessons: [],
    quizScores: {},
    achievements: [],
  });
  const [loading, setLoading] = useState(true);

  const refreshProgress = async () => {
    try {
      const response = await learningApi.getProgress();
      if (response.success && response.data) {
        const normalized = normalizeProgress(response.data);
        setProgress((prev) => ({
          ...normalized,
          achievements: prev.achievements, // Keep achievements until we refresh them
        }));
      }
    } catch (error: any) {
      console.error("Failed to fetch progress:", error.message);
      if (!loading) {
        toast.error("Failed to load progress");
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshAchievements = async () => {
    try {
      const response = await achievementsApi.getAchievements();
      if (response.success && response.data) {
        setProgress((prev) => ({
          ...prev,
          achievements: response.data || [],
        }));
      }
    } catch (error: any) {
      console.error("Failed to fetch achievements:", error.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([refreshProgress(), refreshAchievements()]);
    };
    loadData();
  }, []);

  const completeLesson = async (moduleId: number, lessonId: string): Promise<void> => {
    try {
      const response = await learningApi.completeLesson(moduleId.toString(), lessonId);
      if (response.success && response.data) {
        const normalized = normalizeProgress(response.data);
        setProgress((prev) => ({
          ...normalized,
          achievements: prev.achievements,
        }));
        toast.success("Lesson complete! +50 XP, +₹30");
        await refreshAchievements(); // Check for new achievements
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to complete lesson");
      throw error;
    }
  };

  const completeQuiz = async (
    moduleId: number,
    answers: number[],
    timeSpent: number
  ): Promise<void> => {
    try {
      const response = await learningApi.submitQuiz(moduleId.toString(), answers, timeSpent);
      if (response.success && response.data) {
        const normalized = normalizeProgress(response.data);
        setProgress((prev) => ({
          ...normalized,
          achievements: prev.achievements,
        }));
        await refreshAchievements(); // Check for new achievements
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit quiz");
      throw error;
    }
  };

  const checkAchievements = async (): Promise<void> => {
    try {
      await achievementsApi.checkAchievements();
      await refreshAchievements();
    } catch (error: any) {
      console.error("Failed to check achievements:", error.message);
    }
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
        loading,
        refreshProgress,
        refreshAchievements,
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
