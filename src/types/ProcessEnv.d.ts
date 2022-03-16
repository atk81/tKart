declare namespace NodeJS{
    export interface ProcessEnv{
        PORT: string;
        NODE_ENV: string;
        PASSPHRASE: string;
        JWT_EXPIRY: string;
        JWT_ALGORITHM: string;
        FORGET_PASSWORD_EXPIRES: number;
        COOKIE_EXPIRY: number,
    }
}