import jwt from 'jsonwebtoken';
import conf from '../../config';

export const generateAuthToken = (user: any): string => {
    // Generate and return an authentication token based on the user's information
    const secretKey = conf.jwt_key;
    const tokenPayload = {
        userId: user.id,
        username: user.username,
    };

    const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });

    return token;
};
