import { getTokenPayload } from "../../../lib/getTokenPayload";
const verifyToken = (req: any, res: any, next: any) => {
    let type;
    try {
        type = req.headers.authorization.split(' ')[0];
    } catch (err) {
        return res.status(400).json({ message: 'Bad Request' });
    }
    if (type != "Bearer") {
        return res.status(401).json({ message: 'Invalid type' });
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        // No token provided
        return res.status(401).json({ message: 'Access denied, token missing' });
    };
    try {
        const { userId } = getTokenPayload(token)
        req.headers.userId = userId;
        next();
    } catch (error: any) {
        return res.status(401).json({ message: error.message });
    }
}

export {
    verifyToken
}