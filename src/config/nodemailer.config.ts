import nodemailer from "nodemailer";
import mailergunNodemailer from "nodemailer-mailgun-transport";

export class Nodemailer{
    private transporter: nodemailer.Transporter;
    constructor(){
        this.transporter = nodemailer.createTransport(mailergunNodemailer({
            auth: {
                api_key: process.env.MAILGUN_API_KEY,
                domain: process.env.MAILGUN_DOMAIN,
            }
        }));
    }

    /**
     * Send email for confirmation user email
     * @param name Name of the user
     * @param email email of the user
     * @param token JWT token
     */
    public async sendEmailConfirmation(name: string, email: string, token: string): Promise<void>{
        const message = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Confirm your email",
            html: `<h1>Email Confirmation</h1>
            <h2>Hello ${name}</h2>
            <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
            <a href=http://localhost:${process.env.PORT}/confirm/${token}> Click here</a>
            </div>`,
        };

        return await this.transporter.sendMail(message);
    }
}
