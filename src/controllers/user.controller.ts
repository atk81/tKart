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
import crypto from "crypto";
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

    try{
        /**
         * If the user already exists, delete the user and follow the same process.
         */ 
        if(user){
            await User.findByIdAndDelete(user._id);
        }
        // Start uploading the photo.
        let result = null;
        if(req.files){
            result = await Cloudinary.getInstance().uploadUsersProfile(req.files);
        }
        user = await User.create({
            name,
            email,
            password,
            photo: result ? result.secure_url : null,
        });
        const nodemailer: Nodemailer = new Nodemailer();
        const emailConfirmationToken = await user.getJWTToken();
        const url = `${req.protocol}://${req.get('host')}/api/v1/signup/verify/${emailConfirmationToken}`;
        await nodemailer.sendEmailConfirmation(name, email, url);
        // Hide the password
        user.password = null;
        // Generate the token
        cookieToken(user, res);
    }
    catch(err){
        /**
         * If the type of error is a mongoose validation error, return a validation error
         * If the error is from nodemailer, return a application error, but delete the user from the database.
         * else return a application error.
         */
        if(err instanceof mongoose.Error.ValidationError) {
            // !TODO: Need to handle the validation error!
            const error = new CustomError(400, "Validation", err.message, [err.message]);
            next(error);
        } else{
            if(user){
                await User.findByIdAndDelete(user._id);
            }
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
            await user.updateOne({ status: "active" });
            // Hide the password
            user.password = null;
            // Generate the token
            cookieToken(user, res);
        }
    } catch(err){
        const error = new CustomError(500, "Application", "Error while doing some user operation", err);
        return next(error);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    // Get the user info {email, password}
    const { email, password } = req.body;

    // check if user, password is not empty
    if(!email || !password) {
        const err = new CustomError(400, "General", "email and password are required", null);
        return next(err);
    }

    // Find the user
    let user: IUser = null;
    try{
        user = await (await User.findOne({ email }).select("+password"));
    } catch(err){
        const error = new CustomError(500, "Application", "Error finding user", err);
        return next(error);
    }

    // Check if the user exists
    if(!user) {
        const err = new CustomError(400, "General", "User not found", null);
        return next(err);
    }

    // Check if the user is active
    if(user.status !== "active") {
        const err = new CustomError(400, "General", "User is not active", null);
        return next(err);
    }

    // Check if the password is correct
    if(!(await user.isValidPassword(password))) {
        const err = new CustomError(400, "General", "Password is incorrect", null);
        return next(err);
    }

    // Hide the password
    user.password = null;
    cookieToken(user, res);
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    // Remove the token from the cookies
    try{
        res.clearCookie("token");
        res.customSuccess(200, "Logout successful", null);
    } catch(err){
        const error = new CustomError(500, "Application", "Error logging out", err);
        return next(error);
    }
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    // Get the user from the req. body
    const { email } = req.body;
    if(!email) {
        const err = new CustomError(400, "General", "email is required", null);
        return next(err);
    }

    // Check if the user exists
    let user: IUser = null;
    try{
        user = await User.findOne({ email });
    } catch(err){
        const error = new CustomError(500, "Application", "Error finding user", err);
        return next(error);
    }

    if(!user) {
        const err = new CustomError(400, "General", "User not found", null);
        return next(err);
    }

    // Generate the token, and send the email
    const token = await user.generateForgetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const url = `${req.protocol}://${req.get('host')}/api/v1/forgotPassword/verify/${token}`;
    try {
        const nodemailer: Nodemailer = new Nodemailer();
        await nodemailer.sendForgotPassword(user.name, user.email, url);
        res.customSuccess(200, "Email sent", null);
    } catch(err){
        // Reset the forgot password token
        user.resetForgetPasswordToken();
        await user.save({ validateBeforeSave: false });
        const error = new CustomError(500, "Application", "Error sending email", err);
        return next(error);
    }
}

export const resetPasswordByToken = async (req: Request, res: Response, next: NextFunction) => {
    let token = req.params.token;
    if(!token) {
        const err = new CustomError(400, "General", "Token is required", null);
        return next(err);
    }

    token = crypto.createHash('sha256').update(token).digest('hex');

    try{
        // find the user from the database, which expiray date in future.
        const user = await User.findOne({
            forgetPasswordToken: token,
            forgetPasswordExpires: { $gt: Date.now() }
        });
        if(!user) {
            const err = new CustomError(400, "General", "Token is invalid or has expired", null);
            return next(err);
        }
        // Update the user password
        user.password = req.body.password;
        user.resetForgetPasswordToken();
        await user.save();
        res.customSuccess(200, "Password updated", null);
    } catch(err){
        const error = new CustomError(500, "Application", "Error resetting password", err);
        return next(error);
    }
}
