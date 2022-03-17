import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../utils/response/error';
import User, { IUser } from '../models/user.model';
import { cookieToken } from '../utils/cookieToken';
import mongoose from 'mongoose';
import { Cloudinary } from '../config/cloudinary.config';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    // Get the user info from the request body
    const { email, password, name } = req.body;
    if(!email || !password || !name) {
        const err = new CustomError(400, "General", "email, password, and name are required", null);
        return next(err);
    }

    // !Need to Remove after sometimes
    // !Start.........
    let result = null;
    if(req.files){
        result = await Cloudinary.getInstance().uploadUsersProfile(req.files);
    }
    // Check if the user already exists
    try{
        const user = await User.findOne({ email });
        if(user) {
            const err = new CustomError(400, "General", "User already exists", null);
            return next(err);
        }
    } catch(err){
        const error = new CustomError(500, "Application", "Error finding user", err);
        return next(error);
    }

    // Create the user
    try{
        const newUser: IUser = await User.create({ email, password, name, photo: result ? {
            id: result.public_id,
            secure_url: result.secure_url,
        }: null });
        // Generate the token
        cookieToken(newUser, res);
    }
    catch(err){
        if(err instanceof mongoose.Error.ValidationError) {
            const error = new CustomError(400, "Validation", err.message, [err.message]);
            next(error);
        } else{
            const error = new CustomError(500, "Application", "Error creating user", err);
            next(error);
        }
    }
}
