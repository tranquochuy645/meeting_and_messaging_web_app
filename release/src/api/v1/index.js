"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = __importDefault(require("./auth"));
const rooms_1 = __importDefault(require("./rooms"));
const users_1 = __importDefault(require("./users"));
const search_1 = __importDefault(require("./search"));
const router = (0, express_1.Router)();
// Create a rate limiter middleware for general routes
const generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});
// Create a rate limiter middleware specifically for the /auth route
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 5000,
    max: 30,
    message: 'Too many requests for authentication from this IP, please try again later.',
});
router.use('/auth', authLimiter, auth_1.default);
router.use('/rooms', generalLimiter, rooms_1.default);
router.use('/users', generalLimiter, users_1.default);
router.use('/search', generalLimiter, search_1.default);
exports.default = router;
