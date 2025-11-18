"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addXp = exports.updateProfile = exports.logout = exports.getProfile = exports.login = exports.signup = void 0;
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const response_1 = __importDefault(require("../../utils/response"));
const User_1 = require("../../models/User");
const auth_service_1 = require("./auth.service");
exports.signup = (0, asyncHandler_1.default)(async (req, res) => {
    const existing = await User_1.UserModel.findOne({ email: req.body.email.toLowerCase() });
    if (existing) {
        throw new ApiError_1.default(409, 'Email already in use');
    }
    const user = await User_1.UserModel.create({ ...req.body, email: req.body.email.toLowerCase() });
    await (0, auth_service_1.ensureUserCompanions)(user.id);
    const token = (0, auth_service_1.signToken)(user.id);
    return (0, response_1.default)(res, {
        token,
        user: (0, auth_service_1.sanitizeUser)(user)
    }, 'Account created', 201);
});
exports.login = (0, asyncHandler_1.default)(async (req, res) => {
    const user = await User_1.UserModel.findOne({ email: req.body.email.toLowerCase() }).select('+password');
    if (!user) {
        throw new ApiError_1.default(401, 'Invalid credentials');
    }
    const isValid = await user.comparePassword(req.body.password);
    if (!isValid) {
        throw new ApiError_1.default(401, 'Invalid credentials');
    }
    (0, auth_service_1.updateLoginStreak)(user);
    await user.save();
    await (0, auth_service_1.ensureUserCompanions)(user.id);
    const token = (0, auth_service_1.signToken)(user.id);
    return (0, response_1.default)(res, { token, user: (0, auth_service_1.sanitizeUser)(user) }, 'Login successful');
});
exports.getProfile = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.user) {
        throw new ApiError_1.default(401, 'Authentication required');
    }
    const freshUser = await User_1.UserModel.findById(req.user.id);
    if (!freshUser) {
        throw new ApiError_1.default(404, 'User not found');
    }
    return (0, response_1.default)(res, (0, auth_service_1.sanitizeUser)(freshUser));
});
exports.logout = (0, asyncHandler_1.default)(async (_req, res) => {
    return (0, response_1.default)(res, { ok: true }, 'Logged out');
});
exports.updateProfile = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.user) {
        throw new ApiError_1.default(401, 'Authentication required');
    }
    const updated = await User_1.UserModel.findByIdAndUpdate(req.user.id, req.body, { new: true });
    if (!updated) {
        throw new ApiError_1.default(404, 'User not found');
    }
    return (0, response_1.default)(res, (0, auth_service_1.sanitizeUser)(updated), 'Profile updated');
});
exports.addXp = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.user) {
        throw new ApiError_1.default(401, 'Authentication required');
    }
    const user = await (0, auth_service_1.addXpToUser)(req.user.id, req.body.amount);
    return (0, response_1.default)(res, user, 'XP updated');
});
