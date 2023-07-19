"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenViaSocketIO = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../../config"));
const verifyTokenViaSocketIO = (socket, next) => {
    try {
        const secretKey = config_1.default.jwt_key;
        const type = socket.handshake.headers.authorization.split(' ')[0];
        if (type != "Bearer") {
            throw new Error("Invalid authorization header");
        }
        const token = socket.handshake.headers.authorization.split(' ')[1];
        if (!token) {
            // No token provided
            throw new Error("Token missing");
        }
        ;
        const { userId } = jsonwebtoken_1.default.verify(token, secretKey);
        if (!userId) {
            throw new Error("Invalid token");
        }
        socket.handshake.headers.userId = userId;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.verifyTokenViaSocketIO = verifyTokenViaSocketIO;
