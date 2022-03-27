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
        if(user){
            // delete the user from the database
            await User.findByIdAndDelete(user._id);
        }
        let result = null;
        if(req.files){
            result = await Cloudinary.getInstance().uploadUsersProfile(req.files);
        }
        user = await User.create({
            name,
            email,
            password,
            status: "pending",
            role: "user",
            photo: result ? result.secure_url : null
        });
        // TODO: Send email to user to verify email, don't save into database
        // TODO: Encypt the emailconfirmationtoken for readability
        // !Confirm email - Send email, and set the token into database
        const nodemailer: Nodemailer = new Nodemailer();
        const emailConfirmationToken = await user.getJWTToken();
        await nodemailer.sendEmailConfirmation(name, email, emailConfirmationToken);
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
            await user.updateOne({ status: "active" });
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