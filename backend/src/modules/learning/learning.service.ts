import ApiError from '../../utils/ApiError';
import { addLucre } from '../wallet/wallet.service';
import { addXpToUser } from '../auth/auth.service';
import { ProgressModel } from '../../models/Progress';
import { buildAchievementState } from '../../data/achievements';
import { modules } from '../../data/modules';
import { getLessonContent } from '../../data/lessons';
import { getQuizQuestions } from '../../data/quizzes';

export const getProgressForUser = async (userId: string) => {
  const progress =
    (await ProgressModel.findOne({ user: userId })) ||
    (await ProgressModel.create({
      user: userId,
      achievements: buildAchievementState()
    }));
  return progress;
};

export const listModulesWithProgress = async (userId: string) => {
  const progress = await getProgressForUser(userId);
  return { modules, progress };
};

export const fetchLessonContent = (moduleId: string, lessonId: string) => {
  return getLessonContent(moduleId, lessonId);
};

export const completeLesson = async (userId: string, moduleId: number, lessonId: string) => {
  const progress = await getProgressForUser(userId);
  const lessonKey = `${moduleId}.${lessonId}`;

  if (!progress.completedLessons.includes(lessonKey)) {
    progress.completedLessons.push(lessonKey);
  }

  if (!progress.completedModules.includes(moduleId - 1) && moduleId > 1) {
    // ensure sequential unlocking
    progress.completedModules = Array.from(new Set(progress.completedModules));
  }

  progress.currentModule = Math.max(progress.currentModule, moduleId);
  await progress.save();

  const [user, wallet] = await Promise.all([
    addXpToUser(userId, 50),
    addLucre(userId, 30, `Completed Lesson ${lessonKey}`)
  ]);

  return { progress, user, wallet, lessonKey };
};

export const getQuiz = (moduleId: number) => {
  const moduleExists = modules.find((mod) => mod.id === moduleId);
  if (!moduleExists) {
    throw new ApiError(404, 'Module not found');
  }
  return getQuizQuestions(moduleId);
};

export const submitQuiz = async (userId: string, moduleId: number, answers: number[], timeSpent: number) => {
  const questions = getQuiz(moduleId);
  if (answers.length !== questions.length) {
    throw new ApiError(400, 'Answer count mismatch');
  }

  let score = 0;
  answers.forEach((answer, index) => {
    if (questions[index].correct === answer) {
      score += 1;
    }
  });

  const total = questions.length;
  const percentage = (score / total) * 100;

  const progress = await getProgressForUser(userId);
  const quizId = `quiz-${moduleId}`;

  const existingIdx = progress.quizScores.findIndex((qs) => qs.quizId === quizId);
  const quizEntry = {
    quizId,
    score,
    total,
    timeSpent,
    date: new Date()
  };

  if (existingIdx >= 0) {
    progress.quizScores[existingIdx] = quizEntry;
  } else {
    progress.quizScores.push(quizEntry);
  }

  if (percentage >= 70 && !progress.completedModules.includes(moduleId)) {
    progress.completedModules.push(moduleId);
    progress.currentModule = Math.min(moduleId + 1, modules.length);
  }

  await progress.save();

  const xpEarned = score * 10;
  const moneyEarned = Math.floor(percentage);

  const [user, wallet] = await Promise.all([
    addXpToUser(userId, xpEarned),
    addLucre(userId, moneyEarned, `Quiz ${quizId}: ${score}/${total}`)
  ]);

  return { progress, user, wallet, quiz: quizEntry, percentage };
};

