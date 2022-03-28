import nodemailer from "nodemailer";

export class Nodemailer{
    private transporter: nodemailer.Transporter;
    constructor(){
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: 587,
            auth: {
                user: process.env.SMTP_USER, // generated ethereal user
                pass: process.env.SMTP_PASSWORD, // generated ethereal password
            },
        });
    }

    /**
     * Send email for confirmation user email
     * @param name Name of the user
     * @param email email of the user
     * @param url Email confirmation URL
     */
    public async sendEmailConfirmation(name: string, email: string, url: string): Promise<void>{
        const message = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "tKart -- Confirm your email",
            html: `<h1>tKart-- Email Confirmation</h1>
            <h2>Hello ${name}</h2>
            <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
            <a href=${url}> Click here</a>
            <p>Or you can copy and paste the following link into your browser</p>
            <p>${url}</p>
            </div>`,
        };

        return await this.transporter.sendMail(message);
    }

    /**
     * Send email for reset password
     * @param name Name of the user
     * @param email email of the user
     * @param url Reset URL
     */
    public async sendForgotPassword(name: string, email: string, url: string): Promise<void>{
        const message = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "tKart-- Reset Password",
            html: `<h1>tKart-- Reset your Password</h1>
            <h2>Hello ${name}</h2>
            <p>Please reset your password by clicking on the following link</p>
            <a href=${url}> Click here</a>
            <p>Or you can copy and paste the following link into your browser</p>
            <p>${url}</p>
            </div>`,
        };

        return await this.transporter.sendMail(message);
    }
}
