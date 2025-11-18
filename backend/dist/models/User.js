"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    age: Number,
    grade: String,
    school: String,
    knowledgeLevel: { type: String, default: 'Beginner' },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 1 },
    longestStreak: { type: Number, default: 1 },
    lastLogin: { type: Date, default: () => new Date() }
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            const { password, ...rest } = ret;
            return rest;
        }
    }
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    const salt = await bcryptjs_1.default.genSalt(10);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
    next();
});
userSchema.methods.comparePassword = function (candidate) {
    return bcryptjs_1.default.compare(candidate, this.password);
};
exports.UserModel = (0, mongoose_1.model)('User', userSchema);
