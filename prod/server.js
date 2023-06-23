"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
(0, dotenv_1.config)();
const port = process.env.PORT;
const app = (0, express_1.default)();
app.use(express_1.default.static('public'));
const server = (0, http_1.createServer)(app);
server.listen(port);
