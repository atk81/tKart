import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../utils/response/error';
import User from '../models/user.model';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    // Get the user info from the request body
    const { email, password, name } = req.body;
    if(!email || !password || !name) {
        const err = new CustomError(400, "General", "email, password, and name are required", null);
        return next(err);
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
    
}
