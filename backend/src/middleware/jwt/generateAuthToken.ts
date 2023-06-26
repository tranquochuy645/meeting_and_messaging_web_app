    import jwt from 'jsonwebtoken';
    export const generateAuthToken = (user: any): string => {
        // Generate and return an authentication token based on the user's information
        const secretKey = process.env.JWT_KEY
        if (!secretKey) {
            throw new Error("NO JWT KEY")
        }
        const tokenPayload = {
        userId: user.id,
        username: user.username,
        };
    
        const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });
    
        return token;
    };
    