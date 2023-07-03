"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const api_1 = __importDefault(require("./api"));
const faviconPick_1 = require("./middleware/faviconPick");
const jsonFilter_1 = require("./middleware/jsonFilter");
const app = (0, express_1.default)();
// Use the chooseFavicon middleware to dynamically set the favicon based on the device
app.use(faviconPick_1.chooseFavicon);
app.use('/api', express_1.default.json(), jsonFilter_1.filterJsonError, api_1.default);
// app.use('/api', api);
app.get('/', express_1.default.static('public'));
exports.default = app;
