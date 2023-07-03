import jwt from 'jsonwebtoken';
import conf from '../../config';
interface userPayload{
    _id: any;
    password: string;
}
export const generateAuthToken = (user: userPayload): string => {

    // Generate and return an authentication token based on the user's information
    const secretKey = conf.jwt_key;
    const tokenPayload = {
        userId: user._id,
        password: user.password,
    };

    const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });

    return token;
};
