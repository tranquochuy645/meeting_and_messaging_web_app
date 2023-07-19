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
    var _a;
    if ((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.password) {
        const password = req.body.password;
        if (isWeakPassword(password)) {
            return res.status(422).json({ message: "Weak Password" });
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
