import jwt from 'jsonwebtoken';
import conf from '../../config';

export const generateAuthToken = (userId: string): string => {
    // Generate and return an authentication token based on the user's information
    const secretKey = conf.jwt_key;
    const tokenPayload = { userId };
    const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '2h' });
    return token;
};
export const generateAuthToken_v2 = (userId: string): string => {
    // This version includes additional payload claims that required by firebase
    // Generate and return an authentication token based on the user's information
    const secretKey = conf.jwt_key;
    const now = new Date();
    const expirationTime = new Date(now.getTime() + 3600 * 1000); // 3600 seconds (1 hour) in milliseconds
    const tokenPayload = {
        uid: userId,
        exp: Math.floor(expirationTime.getTime() / 1000), // Convert expirationTime to seconds
        iat: Math.floor(now.getTime() / 1000), // Convert current time to seconds
        aud: "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
        sub: conf.service_account_email,
        iss: conf.service_account_email,
        alg: "RS256"
    };
    const token = jwt.sign(tokenPayload, secretKey);
    return token;
}
