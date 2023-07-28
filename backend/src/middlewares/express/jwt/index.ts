import { getTokenPayload } from "../../../lib/getTokenPayload";

/**
 * Middleware for verifying the access token in the request headers and extracting the user ID from the token.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next function to pass control to the next middleware.
 * @returns {Promise<void>} - A Promise that resolves to passing control to the next middleware or sending an error response.
 */
const verifyToken = (req: any, res: any, next: any) => {
    let type;
    try {
        // Get the type of the token from the 'Authorization' header (e.g., 'Bearer' or 'Token').
        type = req.headers.authorization.split(' ')[0];
    } catch (err) {
        // If the 'Authorization' header is missing or malformed, send a 400 status with an error message.
        return res.status(400).json({ message: 'Bad Request' });
    }

    // Check if the token type is 'Bearer'.
    if (type != "Bearer") {
        // If the token type is not 'Bearer', send a 401 status with an error message.
        return res.status(401).json({ message: 'Invalid type' });
    }

    // Extract the token itself (without the type prefix) from the 'Authorization' header.
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        // If no token is provided, send a 401 status with an error message.
        return res.status(401).json({ message: 'Access denied, token missing' });
    };

    try {
        // Verify the token and get the user ID from the payload using the 'getTokenPayload' function.
        const { userId } = getTokenPayload(token);
        // Attach the user ID to the request headers to be used in subsequent middleware or route handlers.
        req.headers.userId = userId;
        // Proceed to the next middleware or route handler.
        next();
    } catch (error: any) {
        // If the token verification fails, send a 401 status with an error message.
        return res.status(401).json({ message: error.message });
    }
}

export {
    verifyToken
}
