import nodemailer from "nodemailer";
import { IUser } from "../models/user.model";

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

    /**
     * Send email to Admin for a role change request by a user
     * @param name Name of the Admin
     * @param email email of the Admin
     * @param user User Model
     * @param approveURL Approve URL
     * @param rejectURL Reject URL
     * @param validRole Roles of the user
     */
    public async sendUserRequestForRoleChange(name: string, email: string, approveURL: string, rejectURL: string, user: IUser, validRole: string[]): Promise<void>{
        const message = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "tKart-- Request for role change",
            html: `<h1>tKart-- Request for role change</h1>
            <h2>Hello ${name}</h2>
            <p> ${user.name} has requested to change his/her role</p>
            <p> Role change requested are as follows:</p>
            <p> ${validRole.join(", ")}</p>
            <p>Please click on the following link to <a href=${approveURL}> approve </a> or <a href=${rejectURL}> reject </a> the request</p>
            </div>`,
        };

        return await this.transporter.sendMail(message);
    }

    /**
     * Send email to User once Admin approves the role change request
     * @param name Name of the User
     * @param email email of the User
     * @param approval Boolean
     */
    public async sendAdminResponseForRoleChange(name: string, email: string, approval: boolean): Promise<void>{
        const message = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "tKart-- Response for role change",
            html: `<h1>tKart-- Response for role change</h1>
            <h2>Hello ${name}</h2>
            <p> Your request for role change is ${approval ? 'Approved' : 'Rejected'}</p>
            </div>`,
        };
        return await this.transporter.sendMail(message);
    }
}
