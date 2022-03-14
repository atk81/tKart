import { generateKeyPairSync } from 'crypto';
import { join } from 'path';
import { writeFileSync } from 'fs';
import { config } from 'dotenv';
config();

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: process.env.PASSPHRASE
    }
});

writeFileSync(join(__dirname, "..",'.private.key'), privateKey);
writeFileSync(join(__dirname, "..",'.public.key.pem'), publicKey);
