import jwt, { JwtPayload } from 'jsonwebtoken';
import conf from '../../../config';
const verifyTokenViaSocketIO = (socket: any, next: any) => {
    try {
        const secretKey = conf.jwt_key;
        const type = socket.handshake.headers.authorization.split(' ')[0];
        if (type != "Bearer") {
            throw new Error("Invalid authorization header");
        }
        const token = socket.handshake.headers.authorization.split(' ')[1];
        if (!token) {
            // No token provided
            throw new Error("Token missing");
        };
        const { userId } = jwt.verify(token, secretKey) as JwtPayload;
        if (!userId) {
            throw new Error("Invalid token");
        }
        socket.handshake.headers.userId=userId
        next()
    } catch (error) {
        next(error)
    }
}

export {
    verifyTokenViaSocketIO
}