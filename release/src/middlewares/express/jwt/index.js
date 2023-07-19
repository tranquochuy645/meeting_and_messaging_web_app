"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../../config"));
const verifyToken = (req, res, next) => {
    const secretKey = config_1.default.jwt_key;
    let type;
    try {
        type = req.headers.authorization.split(' ')[0];
    }
    catch (err) {
        return res.status(400).json({ message: 'Bad Request' });
    }
    if (type != "Bearer") {
        return res.status(401).json({ message: 'Invalid type' });
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        // No token provided
        return res.status(401).json({ message: 'Access denied, token missing' });
    }
    ;
    try {
        const { userId, fullname } = jsonwebtoken_1.default.verify(token, secretKey);
        req.headers.userId = userId;
        req.headers.fullname = fullname;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: error.message });
    }
};
exports.verifyToken = verifyToken;
