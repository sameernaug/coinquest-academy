/** @format */

import { useProgress } from "./ProgressContext";
import DashboardLayout from "@/shared/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Lock, CheckCircle, Circle, Trophy } from "lucide-react";

const modules = [
  {
    id: 1,
    title: "Money Basics",
    icon: "🪙",
    lessons: [
      { id: "1", title: "What is Money?", duration: "5 min" },
      { id: "2", title: "Earning Money", duration: "5 min" },
      { id: "3", title: "Saving vs Spending", duration: "6 min" },
    ],
  },
  {
    id: 2,
    title: "Smart Spending",
    icon: "🛒",
    lessons: [
      { id: "1", title: "Needs vs Wants", duration: "5 min" },
      { id: "2", title: "Making Choices", duration: "6 min" },
      { id: "3", title: "Avoiding Waste", duration: "5 min" },
    ],
  },
  {
    id: 3,
    title: "The Saving Adventure",
    icon: "💰",
    lessons: [
      { id: "1", title: "Why Save Money?", duration: "5 min" },
      { id: "2", title: "Setting Goals", duration: "6 min" },
      { id: "3", title: "Piggy Banks & Bank Accounts", duration: "7 min" },
    ],
  },
  {
    id: 4,
    title: "Understanding Banks",
    icon: "🏦",
    lessons: [
      { id: "1", title: "What Banks Do", duration: "5 min" },
      { id: "2", title: "Interest - Money That Grows!", duration: "6 min" },
      { id: "3", title: "Keeping Money Safe", duration: "5 min" },
    ],
  },
  {
    id: 5,
    title: "Introduction to Earning",
    icon: "💼",
    lessons: [
      { id: "1", title: "Jobs and Work", duration: "5 min" },
      { id: "2", title: "Allowance and Chores", duration: "6 min" },
      { id: "3", title: "Starting Small Businesses", duration: "7 min" },
    ],
  },
];

const Learning = () => {
  const { progress, getModuleProgress, isLessonUnlocked } = useProgress();

  const overallProgress = (progress.completedLessons.length / 15) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Learning Path 📚</h1>
          <p className="text-muted-foreground">
            Follow your personalized learning journey
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Overall Progress</h3>
              <p className="text-sm text-muted-foreground">
                {progress.completedLessons.length} of 15 lessons complete
              </p>
            </div>
            <div className="text-4xl">{Math.round(overallProgress)}%</div>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-primary transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Total XP earned from learning:{" "}
            {progress.completedLessons.length * 50}
          </p>
        </Card>

        {/* Learning Path */}
        <div className="space-y-8">
          {modules.map((module, moduleIndex) => {
            const isModuleUnlocked =
              moduleIndex === 0 ||
              progress.completedModules.includes(moduleIndex);
            const moduleProgress = getModuleProgress(module.id);
            const completedLessons = progress.completedLessons.filter((l) =>
              l.startsWith(`${module.id}.`)
            ).length;

            return (
              <Card
                key={module.id}
                className={`p-6 ${
                  isModuleUnlocked ? "hover-lift" : "opacity-60"
                }`}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-6xl">{module.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">
                        Module {module.id}: {module.title}
                      </h2>
                      {!isModuleUnlocked && (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                      {progress.completedModules.includes(module.id) && (
                        <CheckCircle className="h-6 w-6 text-success" />
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                      <span>
                        {completedLessons}/{module.lessons.length} lessons
                      </span>
                      <span>+{module.lessons.length * 50 + 100} XP</span>
                      <span>
                        ~
                        {module.lessons.reduce(
                          (sum, l) => sum + parseInt(l.duration),
                          0
                        )}{" "}
                        min
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round(moduleProgress)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${moduleProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lessons */}
                <div className="space-y-3 pl-20">
                  {module.lessons.map((lesson) => {
                    const lessonKey = `${module.id}.${lesson.id}`;
                    const isCompleted =
                      progress.completedLessons.includes(lessonKey);
                    const isUnlocked = isLessonUnlocked(module.id, lesson.id);

                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border ${
                          isCompleted
                            ? "bg-success/5 border-success/20"
                            : isUnlocked
                            ? "bg-card hover:bg-muted transition-colors"
                            : "bg-muted/50 opacity-60"
                        }`}
                      >
                        <div>
                          {isCompleted ? (
                            <CheckCircle className="h-6 w-6 text-success" />
                          ) : isUnlocked ? (
                            <Circle className="h-6 w-6 text-primary" />
                          ) : (
                            <Lock className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium">
                            Lesson {module.id}.{lesson.id}: {lesson.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {lesson.duration} • +50 XP
                          </p>
                        </div>

                        {isUnlocked && !isCompleted && (
                          <Link to={`/lesson/${module.id}/${lesson.id}`}>
                            <Button className="bg-primary hover:bg-primary/90">
                              Start Lesson
                            </Button>
                          </Link>
                        )}
                        {isCompleted && (
                          <Link to={`/lesson/${module.id}/${lesson.id}`}>
                            <Button variant="outline">Review</Button>
                          </Link>
                        )}
                      </div>
                    );
                  })}

                  {/* Quiz */}
                  <div
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      progress.completedModules.includes(module.id)
                        ? "bg-accent/5 border-accent/20"
                        : moduleProgress === 100
                        ? "bg-card hover:bg-muted transition-colors"
                        : "bg-muted/50 opacity-60"
                    }`}
                  >
                    <Trophy
                      className={`h-6 w-6 ${
                        progress.completedModules.includes(module.id)
                          ? "text-accent"
                          : "text-muted-foreground"
                      }`}
                    />

                    <div className="flex-1">
                      <h4 className="font-medium">
                        Quiz {module.id}: {module.title} Challenge
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        10 questions • +100 XP
                      </p>
                    </div>

                    {moduleProgress === 100 &&
                      !progress.completedModules.includes(module.id) && (
                        <Link to={`/quiz/${module.id}`}>
                          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            Take Quiz
                          </Button>
                        </Link>
                      )}
                    {progress.completedModules.includes(module.id) && (
                      <Link to={`/quiz/${module.id}`}>
                        <Button variant="outline">Retake</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Learning;
