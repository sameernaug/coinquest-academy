"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xpSchema = exports.updateProfileSchema = exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    age: zod_1.z.number().min(5).max(18).optional(),
    grade: zod_1.z.string().optional(),
    school: zod_1.z.string().optional()
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    age: zod_1.z.number().min(5).max(18).optional(),
    grade: zod_1.z.string().optional(),
    school: zod_1.z.string().optional(),
    knowledgeLevel: zod_1.z.string().optional()
});
exports.xpSchema = zod_1.z.object({
    amount: zod_1.z.number().min(1).max(1000)
});
