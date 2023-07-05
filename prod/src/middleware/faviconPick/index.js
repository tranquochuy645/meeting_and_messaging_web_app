"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chooseFavicon = void 0;
const express_favicon_1 = __importDefault(require("express-favicon"));
const path_1 = __importDefault(require("path"));
// Define the function to choose the appropriate favicon based on the device
const chooseFavicon = (req, res, next) => {
    const userAgent = req === null || req === void 0 ? void 0 : req.headers['user-agent'];
    // Check the user-agent to determine the device and set the corresponding favicon path
    let faviconPath = '';
    if (userAgent === null || userAgent === void 0 ? void 0 : userAgent.includes('Android')) {
        faviconPath = 'android-chrome-192x192.png';
    }
    else if (userAgent === null || userAgent === void 0 ? void 0 : userAgent.includes('iPhone')) {
        faviconPath = 'apple-touch-icon.png';
    }
    else {
        faviconPath = 'favicon.ico';
    }
    // Set the favicon middleware using the determined favicon path
    const faviconFilePath = path_1.default.join(__dirname, '..', '..', '..', 'public', 'favicon_io', faviconPath);
    (0, express_favicon_1.default)(faviconFilePath)(req, res, next);
};
exports.chooseFavicon = chooseFavicon;
