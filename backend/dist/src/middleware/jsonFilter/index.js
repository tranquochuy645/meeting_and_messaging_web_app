"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterJsonError = void 0;
const filterJsonError = (err, req, res, next) => {
    if (err instanceof SyntaxError) {
        res.status(400).send({ status: 400, message: err.message }); // Bad json
    }
    else {
        next();
    }
};
exports.filterJsonError = filterJsonError;
