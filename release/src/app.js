"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const api_1 = __importDefault(require("./api"));
const faviconPick_1 = require("./middlewares/express/faviconPick");
const jsonFilter_1 = require("./middlewares/express/jsonFilter");
const app = (0, express_1.default)();
const publicPath = path_1.default.resolve(__dirname, '../public');
const indexPath = path_1.default.join(publicPath, 'index.html');
app.use(express_1.default.static(publicPath));
app.use(faviconPick_1.chooseFavicon);
app.use('/api', express_1.default.json(), jsonFilter_1.filterJsonError, api_1.default);
app.get('*', (req, res) => {
    res.sendFile(indexPath);
});
exports.default = app;
