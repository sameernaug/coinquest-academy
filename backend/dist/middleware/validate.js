"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const validate = (schema, source = 'body') => (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
        return next(new ApiError_1.default(400, 'Validation failed', result.error.flatten()));
    }
    req[source] = result.data;
    return next();
};
exports.validate = validate;
exports.default = exports.validate;
