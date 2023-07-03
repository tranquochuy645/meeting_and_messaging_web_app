"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badJsonFilter = void 0;
const badJsonFilter = (req, res, next) => {
    // if (res instanceof SyntaxError || res.status == 400) {
    //     res.status(400).json({ error: 'Invalid JSON payload' });
    // } else {
    //     next();
    // }
};
exports.badJsonFilter = badJsonFilter;
