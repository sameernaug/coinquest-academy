"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuiz = exports.getQuiz = exports.completeLesson = exports.fetchLessonContent = exports.listModulesWithProgress = exports.getProgressForUser = void 0;
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const wallet_service_1 = require("../wallet/wallet.service");
const auth_service_1 = require("../auth/auth.service");
const Progress_1 = require("../../models/Progress");
const achievements_1 = require("../../data/achievements");
const modules_1 = require("../../data/modules");
const lessons_1 = require("../../data/lessons");
const quizzes_1 = require("../../data/quizzes");
const getProgressForUser = async (userId) => {
    const progress = (await Progress_1.ProgressModel.findOne({ user: userId })) ||
        (await Progress_1.ProgressModel.create({
            user: userId,
            achievements: (0, achievements_1.buildAchievementState)()
        }));
    return progress;
};
exports.getProgressForUser = getProgressForUser;
const listModulesWithProgress = async (userId) => {
    const progress = await (0, exports.getProgressForUser)(userId);
    return { modules: modules_1.modules, progress };
};
exports.listModulesWithProgress = listModulesWithProgress;
const fetchLessonContent = (moduleId, lessonId) => {
    return (0, lessons_1.getLessonContent)(moduleId, lessonId);
};
exports.fetchLessonContent = fetchLessonContent;
const completeLesson = async (userId, moduleId, lessonId) => {
    const progress = await (0, exports.getProgressForUser)(userId);
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
        (0, auth_service_1.addXpToUser)(userId, 50),
        (0, wallet_service_1.addLucre)(userId, 30, `Completed Lesson ${lessonKey}`)
    ]);
    return { progress, user, wallet, lessonKey };
};
exports.completeLesson = completeLesson;
const getQuiz = (moduleId) => {
    const moduleExists = modules_1.modules.find((mod) => mod.id === moduleId);
    if (!moduleExists) {
        throw new ApiError_1.default(404, 'Module not found');
    }
    return (0, quizzes_1.getQuizQuestions)(moduleId);
};
exports.getQuiz = getQuiz;
const submitQuiz = async (userId, moduleId, answers, timeSpent) => {
    const questions = (0, exports.getQuiz)(moduleId);
    if (answers.length !== questions.length) {
        throw new ApiError_1.default(400, 'Answer count mismatch');
    }
    let score = 0;
    answers.forEach((answer, index) => {
        if (questions[index].correct === answer) {
            score += 1;
        }
    });
    const total = questions.length;
    const percentage = (score / total) * 100;
    const progress = await (0, exports.getProgressForUser)(userId);
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
    }
    else {
        progress.quizScores.push(quizEntry);
    }
    if (percentage >= 70 && !progress.completedModules.includes(moduleId)) {
        progress.completedModules.push(moduleId);
        progress.currentModule = Math.min(moduleId + 1, modules_1.modules.length);
    }
    await progress.save();
    const xpEarned = score * 10;
    const moneyEarned = Math.floor(percentage);
    const [user, wallet] = await Promise.all([
        (0, auth_service_1.addXpToUser)(userId, xpEarned),
        (0, wallet_service_1.addLucre)(userId, moneyEarned, `Quiz ${quizId}: ${score}/${total}`)
    ]);
    return { progress, user, wallet, quiz: quizEntry, percentage };
};
exports.submitQuiz = submitQuiz;
