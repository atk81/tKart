declare namespace NodeJS{
    export interface ProcessEnv{
        PORT: string;
        NODE_ENV: string;
        PASSPHRASE: string;
        JWT_EXPIRY: string;
        JWT_ALGORITHM: string;
        FORGET_PASSWORD_EXPIRES: number;
        COOKIE_EXPIRY: number,
        CLOUDINARY_NAME: string,
        CLOUDINARY_API_KEY: string,
        CLOUDINARY_API_SECRET: string,
        SENDER_EMAIL: string,
        MAILGUN_API_KEY: string,
        MAILGUN_DOMAIN: string,
    }
}