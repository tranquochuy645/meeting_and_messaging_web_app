"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwt_1 = require("../../middlewares/express/jwt");
const mongodb_1 = require("../../controllers/mongodb");
const mongodb_2 = require("mongodb");
const router = (0, express_1.Router)();
// GET /api/v1/users
router.get('/', jwt_1.verifyToken, async (req, res) => {
    try {
        if (!mongodb_2.ObjectId.isValid(req.headers.userId)) {
            return res.status(400)
                .json({ message: "ID passed in must be a string of 12 bytes or a string of 24 hex characters or an integer" });
        }
        const data = await mongodb_1.chatAppDbController.users.readProfile(req.headers.userId);
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// GET /api/v1/users/:id
router.get('/:id', async (req, res) => {
    try {
        if (!mongodb_2.ObjectId.isValid(req.params.id)) {
            return res.status(400)
                .json({ message: "ID passed in must be a string of 12 bytes or a string of 24 hex characters or an integer" });
        }
        const data = await mongodb_1.chatAppDbController.users.readShortProfile(req.params.id);
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// PUT /api/v1/users/
router.put('/', jwt_1.verifyToken, async (req, res) => {
    try {
        // Extract the update data from req.body
        const updateData = req.body;
        // console.log(req.body);
        const allowedFields = ['password', 'fullname', 'avatar'];
        const updateFields = Object.keys(updateData);
        const invalidFields = updateFields.filter(
        //only accept valid field and string data type
        (field) => !allowedFields.includes(field) || typeof updateData[field] !== 'string');
        if (updateFields.length == 0 || invalidFields.length > 0) {
            return res.status(400).json({ message: 'Invalid update fields', invalidFields });
        }
        // Update the user document by ID with the specified fields
        const result = await mongodb_1.chatAppDbController.users.updateUser(req.headers.userId, updateData);
        if (!result) {
            return res.status(200).json({ message: 'User updated successfully' });
        }
        res.status(404).json({ message: 'User not found' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// DELETE /api/v1/users/:id
router.delete('/:id', (req, res) => {
    // Delete user by ID logic here
});
// Other user-related routes...
exports.default = router;
