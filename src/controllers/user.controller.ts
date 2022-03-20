import { NextFunction, Request, Response } from 'express';
import fs from "fs";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import path from 'path';
import { Cloudinary } from '../config/cloudinary.config';
import { Nodemailer } from '../config/nodemailer.config';
import User, { IUser } from '../models/user.model';
import { cookieToken } from '../utils/cookieToken';
import { CustomError } from '../utils/response/error';
const pathToPublicKey = path.join(__dirname, '..', '..', '.public.key.pem');
const publicKey = fs.readFileSync(pathToPublicKey, 'utf8');

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    // Get the user info from the request body
    const { email, password, name } = req.body;
    if(!email || !password || !name) {
        const err = new CustomError(400, "General", "email, password, and name are required", null);
        return next(err);
    }

    // Check if the user already exists and have status of active
    let user: IUser = null;
    try{
        user = await User.findOne({ email });
        if(user && user.status === "active") {
            const err = new CustomError(400, "General", "User already exists", null);
            return next(err);
        }
    } catch(err){
        const error = new CustomError(500, "Application", "Error finding user", err);
        return next(error);
    }

    // Create the user
    try{
        // !File upload
        let result = null;
        if(req.files){
            result = await Cloudinary.getInstance().uploadUsersProfile(req.files);
        }
        // if user already exists, update only the confirmEmailToken
        if(!user){
            user = await User.create({ email, password, name, photo: (result ? {
                id: result.public_id,
                secure_url: result.secure_url,
            }: null) });
        }
        // !Confirm email - Send email, and set the token into database
        const nodemailer: Nodemailer = new Nodemailer();
        const emailConfirmationToken = await user.getJWTToken();
        await nodemailer.sendEmailConfirmation(name, email, emailConfirmationToken);
        // If someone already try to signup with the same email, but the user is not active,
        // the new user will have update name, password and confirmEmailToken
        await user.updateOne({ password, name, confirmEmailToken: emailConfirmationToken });
        // Hide the password
        user.password = null;
        // Generate the token
        cookieToken(user, res);
    }
    catch(err){
        if(err instanceof mongoose.Error.ValidationError) {
            // !TODO: Need to handle the validation error!
            const error = new CustomError(400, "Validation", err.message, [err.message]);
            next(error);
        } else{
            const error = new CustomError(500, "Application", "Error creating user", err);
            next(error);
        }
    }
}

export const signupVerify = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params.token;
    if(!token) {
        const err = new CustomError(400, "General", "Token is required", null);
        return next(err);
    }

    try{
        // Verify token using JWT
        const decode = jwt.verify(token,publicKey);
        // Check for expiration
        if(decode.exp < Date.now()) {
            const err = new CustomError(400, "General", "Token has expired", null);
            return next(err);
        } else {
            // Find the user
            const user = await User.findById(decode.sub);
            if(!user) {
                const err = new CustomError(400, "General", "User not found", null);
                return next(err);
            } else if(user.status === "active") {
                const err = new CustomError(400, "General", "User already verified", null);
                return next(err);
            }
            // Update the user status
            await user.updateOne({ status: "active", confirmEmailToken: null });
            // Hide the password
            user.password = null;
            // Generate the token
            cookieToken(user, res);
        }
    } catch(err){
        const error = new CustomError(404, "General", "Token is invalid", err);
        return next(error);
    }
}
