"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwt_1 = require("../../middlewares/express/jwt");
const mongodb_1 = require("../../controllers/mongodb");
const router = (0, express_1.Router)();
router.get('/:query', jwt_1.verifyToken, async (req, res) => {
    try {
        const query = req.params.query;
        const result = await mongodb_1.chatAppDbController.users.search(req.headers.userId, query, 5);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.default = router;
