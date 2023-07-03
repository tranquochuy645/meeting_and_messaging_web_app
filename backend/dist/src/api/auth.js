"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongodb_1 = require("../controllers/mongodb");
const jwt_1 = require("../middleware/jwt");
const hanldeRegPassword_1 = require("../middleware/hanldeRegPassword");
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = (0, express_1.Router)();
// POST /api/auth/register
router.post('/register', hanldeRegPassword_1.handleRegPassword, (req, res) => {
    if (Object.keys(req.body).length === 0) {
        res.status(400).json({ message: 'Bad Request' });
        return;
    }
    const { username, password } = req.body;
    // Check if the username already exists in the database
    (0, mongodb_1.getDocuments)('users', { username })
        .then((users) => {
        if (users.length === 0) {
            // Username is available, register the new user
            const newUser = { username, password };
            (0, mongodb_1.insertDocument)('users', newUser)
                .then(() => {
                // User registered successfully
                res.status(200).json({ message: 'Created account successfully' });
            })
                .catch((error) => {
                console.error('Error registering user:', error);
                res.status(500).json({ message: 'Internal server error' });
            });
        }
        else {
            // Username already exists
            res.status(409).json({ message: 'Username already exists' });
        }
    })
        .catch((error) => {
        console.error('Error retrieving user:', error);
        res.status(500).json({ message: 'Internal server error' });
    });
});
// POST /api/auth/login
router.post('/login', (req, res) => {
    if (Object.keys(req.body).length === 0) {
        res.status(400).json({ message: 'Bad Request' });
        return;
    }
    const { username, password } = req.body;
    // Find user in the database based on the provided username and password
    (0, mongodb_1.getDocuments)('users', { username })
        .then((users) => {
        if (users.length !== 1 || !users[0].password) {
            // User not found or multiple users found or null password
            res.status(401).json({ message: 'Invalid credentials' });
        }
        else {
            // User found, validate password 
            const user = users[0];
            const isValid = bcrypt_1.default.compareSync(password, users[0].password);
            if (!isValid) {
                res.status(401).json({ message: 'Invalid credentials' });
            }
            else {
                // Generate and send authentication token
                const authToken = (0, jwt_1.generateAuthToken)({
                    _id: user._id,
                    password: user.password
                });
                res.status(200).json({ authToken });
            }
        }
    })
        .catch((error) => {
        console.error('Error retrieving user:', error);
        res.status(500).json({ message: 'Internal server error' });
    });
});
// POST /api/auth/logout
router.post('/logout', (req, res) => {
    // Logout logic here
});
// Other authentication-related routes...
exports.default = router;
