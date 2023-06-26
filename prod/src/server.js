"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const http_1 = require("http");
const mongodb_1 = require("./controllers/mongodb");
const config_1 = __importDefault(require("./config"));
const dbOpts = {};
const mongo_uri = config_1.default.mongo_uri;
const db_name = config_1.default.db_name;
const port = config_1.default.port || 443;
(0, mongodb_1.connectToDb)(mongo_uri, db_name, dbOpts, (err) => {
    if (err)
        throw err;
});
const server = (0, http_1.createServer)(app_1.default);
server.listen(port);
