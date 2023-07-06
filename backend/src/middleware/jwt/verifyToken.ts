import jwt, { JwtPayload } from 'jsonwebtoken';
import conf from '../../config';

const verifyToken = (req: any, res: any, next: any) => {
    const secretKey = conf.jwt_key;
    let type;
    try {
        type = req.headers.authorization.split(' ')[0];
    } catch (err) {
        return res.status(400).json({ error: 'Bad Request' });
    }
    if (type != "Bearer") {
        return res.status(401).json({ error: 'Invalid type' });
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        // No token provided
        // console.log("token missing");
        return res.status(401).json({ error: 'Access denied, token missing' });
    };
    try {
        const { userId } = jwt.verify(token, secretKey) as JwtPayload;
        req.headers.userId = userId
        next();
    } catch (error) {
        return res.status(401).json({ error });
    }

}

export {
    verifyToken
}