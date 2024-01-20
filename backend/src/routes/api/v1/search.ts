import { Router } from 'express';
import { verifyToken } from '../../../middlewares/express/jwt';
import { chatAppDbController as dc } from '../../../controllers/mongodb';
const router = Router();

// GET /api/v1/search/:query
// Description: This endpoint allows authenticated users to search for other users by their usernames.
// Access: Requires a valid access token. The user must be authenticated.

/**
 * Search for users by their usernames.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise that resolves to sending the response with the search results.
 */
router.get('/:query', verifyToken, async (req, res) => {
    try {
        // Get the search query from the URL parameters.
        const query = req.params.query;
        // Call the 'dc.users.search' method to retrieve users matching the search query (limited to 5 results).
        const result = await dc.users.search(req.headers.userId as string, query, 5);
        // Respond with a 200 status and the search results in JSON format.
        return res.status(200).json(result);
    } catch (error) {
        // If any error occurs during the process, respond with a 500 status and an error message.
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// The endpoint allows the authenticated user to search for other users by their usernames.
// The search query is obtained from the URL parameters (e.g., /api/v1/rooms/:query).
// The 'dc.users.search' method is called to retrieve users matching the search query.
// The search is limited to 5 results, as specified by the 'limit' parameter in the 'dc.users.search' method.
// The search results are sent back to the user in JSON format with a 200 status.
// If any error occurs during the process, a 500 status is returned with an error message.

export default router;
