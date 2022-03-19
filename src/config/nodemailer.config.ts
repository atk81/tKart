import nodemailer from "nodemailer";
import sendgridNodemailer from "nodemailer-sendgrid-transport";

export class Nodemailer{
    private transporter: nodemailer.Transporter;
    constructor(){
        this.transporter = nodemailer.createTransport(sendgridNodemailer({
            auth: {
                api_key: process.env.SENDGRID_API_KEY
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
