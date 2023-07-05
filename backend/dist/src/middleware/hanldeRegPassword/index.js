"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRegPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
// Weak password function
const isWeakPassword = (password) => {
    const minLength = 8; // Minimum password length requirement
    const uppercaseRegex = /[A-Z]/; // Regex to match uppercase letters
    const lowercaseRegex = /[a-z]/; // Regex to match lowercase letters
    const numberRegex = /[0-9]/; // Regex to match numbers
    // Check if the password meets the required criteria
    return (password.length < minLength ||
        !uppercaseRegex.test(password) ||
        !lowercaseRegex.test(password) ||
        !numberRegex.test(password));
};
const handleRegPassword = (req, res, next) => {
    if (req.body && req.body.password) {
        const password = req.body.password;
        // Add your logic to filter weak passwords
        if (isWeakPassword(password)) {
            return res.status(400).json({
                message: 'Weak password. Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number.'
            });
        }
        // Hash the password
        bcrypt_1.default.hash(password, 10, (err, hash) => {
            if (err) {
                throw err;
            }
            else {
                // Update the request body with the hashed password
                req.body.password = hash;
                // Continue to the next middleware or route handler
                next();
            }
        });
    }
};
exports.handleRegPassword = handleRegPassword;
