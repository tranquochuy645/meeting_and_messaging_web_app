"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAuthToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAuthToken = (user) => {
    // Generate and return an authentication token based on the user's information
    const secretKey = process.env.JWT_KEY;
    if (!secretKey) {
        throw new Error("NO JWT KEY");
    }
    const tokenPayload = {
        userId: user.id,
        username: user.username,
    };
    const token = jsonwebtoken_1.default.sign(tokenPayload, secretKey, { expiresIn: '1h' });
    return token;
};
exports.generateAuthToken = generateAuthToken;
