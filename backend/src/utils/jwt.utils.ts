import jwt, { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';
import config from 'config';

const privateKey = config.get<string>('privateKey');
const publicKey = config.get<string>('publicKey');


export function signJwt(object: Object, options?: jwt.SignOptions | undefined) {
    return jwt.sign(object, privateKey, {
        ...(options && options),
        algorithm: 'RS256',
    });
}

export function verifyJwt <T extends object = DefaultJwtPayload>(token: string) {
    try {
        const decoded = jwt.verify(token, publicKey) as T;
        return {
            valid: true,
            expired: false,
            decoded
        };
    }catch(error: any) {
        return {
            valid: false,
            expired: error.message === 'jwt expired',
            decoded: null,
        }
    }
}