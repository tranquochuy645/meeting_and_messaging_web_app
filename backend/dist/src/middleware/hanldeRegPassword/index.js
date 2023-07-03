"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRegPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
// Hash function using bcrypt
const hashPassword = (password) => {
    const saltRounds = 10; // Number of salt rounds for bcrypt
    const hashedPassword = bcrypt_1.default.hashSync(password, saltRounds);
    return hashedPassword;
};
// Weak password function
const isWeakPassword = (password) => {
    const minLength = 8; // Minimum password length requirement
    return password.length < minLength;
};
const handleRegPassword = (req, res, next) => {
    if (req.body && req.body.password) {
        const password = req.body.password;
        // Add your logic to filter weak passwords
        if (isWeakPassword(password)) {
            return res.status(400).json({ message: 'Weak password' });
        }
        // Hash the password
        const hashedPassword = hashPassword(password); // Replace hashFunction with your actual hashing logic
        // Update the request body with the hashed password
        req.body.password = hashedPassword;
    }
    // Continue to the next middleware or route handler
    next();
};
exports.handleRegPassword = handleRegPassword;
