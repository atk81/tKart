import jwt from 'jsonwebtoken';
import path from "path";
import fs from "fs";
import { JWTPayload } from '../types/jwt';
const pathToPublicKey = path.join(__dirname, '..', '..', '.public.key.pem');
const publicKey = fs.readFileSync(pathToPublicKey, 'utf8');


/**
 * Verify JWT token
 * @param token token to verify
 * @returns {Promise<JWTPayload>}
 */
export const verifyJWT = (token: string): Promise<JWTPayload> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, publicKey, (err, decoded) => {
            if (err) {
                reject(err);
            }
            resolve(decoded);
        });
    });
}
