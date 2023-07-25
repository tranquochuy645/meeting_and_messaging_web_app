import conf from "../../config";
import jwt, { JwtPayload } from "jsonwebtoken";
export const getTokenPayload = (token: string) => {
    const secretKey = conf.jwt_key;
    const { userId } = jwt.verify(token, secretKey) as JwtPayload;
    return { userId }
}