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
        SMTP_HOST: string,
        SMTP_PORT: string,
        SMTP_USER: string,
        SMTP_PASSWORD: string,
        STRIPE_API_KEY: string,
        STRIPE_SECRET_KEY: string,
        STRIPE_API_VERSION: string,
        RAZORPAY_API_KEY: string,
        RAZORPAY_SECRET_KEY: string,
    }
}