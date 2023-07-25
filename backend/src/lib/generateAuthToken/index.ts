import jwt from 'jsonwebtoken';
import conf from '../../config';

export const generateAuthToken = (userId: string): string => {
    // Generate and return an authentication token based on the user's information
    const secretKey = conf.jwt_key;
    const tokenPayload = {
        userId
    };
    const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '2h' });
    return token;
};
