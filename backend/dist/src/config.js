"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const conf = {
    jwt_key: process.env.JWT_KEY || "",
    mongo_uri: process.env.MONGO_URI || "",
    db_name: process.env.DB_NAME || "",
    port: process.env.PORT || ""
};
// Validate if any child property is null or undefined
for (const prop in conf) {
    if (conf.hasOwnProperty(prop) && conf[prop] == "") {
        throw new Error(`Missing configuration: ${prop}`);
    }
}
exports.default = conf;
