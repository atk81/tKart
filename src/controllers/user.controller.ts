import crypto from "crypto";
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Cloudinary } from '../config/cloudinary.config';
import { Nodemailer } from '../config/nodemailer.config';
import { logger } from "../logger";
import User, { IUser } from '../models/user.model';
import { cookieToken } from '../utils/cookieToken';
import { CustomError } from '../utils/response/error';

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
        const confirmUserToken = crypto.randomBytes(20).toString('hex');
        const date = new Date();
        const confirmUserExpires: Date = new Date(date.setDate(date.getDate() + 10));
        user = await User.create({
            name,
            email,
            password,
            photo: result ? result.secure_url : null,
            confirmUserToken,
            confirmUserExpires,
        });
        const nodemailer: Nodemailer = new Nodemailer();
        const url = `${req.protocol}://${req.get('host')}/api/v1/signup/verify/${confirmUserToken}`;
        await nodemailer.sendEmailConfirmation(name, email, url);
        user.password = undefined;
        user.confirmUserToken = undefined;
        user.confirmUserExpires = undefined;
        res.customSuccess(200, "User Created Successfully, Mail is send to user mail, please verify before login", {user, url});
    }
    catch(err){
        /**
         * If the type of error is a mongoose validation error, return a validation error
         * If the error is from nodemailer, return a application error, but delete the user from the database.
         * else return a application error.
         */
        if(err instanceof mongoose.Error.ValidationError) {
            const error = new CustomError(400, "Validation", err.message, err);
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
        const result = await User.findOneAndUpdate({
            confirmUserToken: req.params.token,
            confirmUserExpires: { $gt: new Date() },
            status: "pending",
        }, {
            status: "active",
            confirmUserToken: null,
            confirmUserExpires: null,
        }, {
                new: true,
                runValidators: true,
                rawResult: true,
        });
        
        // TODO: if the result is null, return a error, but it's not working
        /*
        onSuccess: result: {
            lastErrorObject: { n: 1, updatedExisting: true },
            value: {
                _id: new ObjectId("624858b6cf6f5e642430577d"),
                name: 'ashutosh',
                email: 'test2@test.com',
                status: 'active',
                role: 'user',
                confirmUserToken: null,
                confirmUserExpires: null,
                createdAt: 2022-04-02T14:07:50.844Z,
                __v: 0
            },
            ok: 1
        }

        onFailure: result: {
            lastErrorObject: { n: 0, updatedExisting: false },
            value: null,
            ok: 1
        }

        so if the result.value is null, return a error.

        But it's not working.

        Getting the error:
        TypeError: Cannot read properties of null (reading 'name')
        at new CustomError (/app/src/utils/response/error.ts:15:18)
        at /app/src/controllers/user.controller.ts:104:25
        at Generator.next (<anonymous>)
        at fulfilled (/app/src/controllers/user.controller.ts:5:58)
        at processTicksAndRejections (node:internal/process/task_queues:96:5)
        */
        // if(result.value===null) {
        //     const err = new CustomError(400, "General", "Token is invalid or expired", null);
        //     return next(err);
        // }
        res.customSuccess(200, "User verified successfully", {user: result.value});
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
        res.customSuccess(200, "Email sent", {url});
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

export const dashboard = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if(!user) {
        const err = new CustomError(400, "General", "User not found", null);
        return next(err);
    }
    res.customSuccess(200, `Hello ${user.name}, You are loggedIn`, user);
}

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user._id).select("+password");
    if(!user) {
        const err = new CustomError(400, "General", "User not found", null);
        return next(err);
    }
    const { oldPassword, newPassword } = req.body;
    if(!oldPassword || !newPassword) {
        const err = new CustomError(400, "General", "oldPassword and newPassword are required", null);
        return next(err);
    }
    if(!(await user.isValidPassword(oldPassword))) {
        const err = new CustomError(400, "General", "oldPassword is incorrect", null);
        return next(err);
    }
    user.password = newPassword;
    try{
        await user.save( { validateBeforeSave: true });
        res.customSuccess(200, "Password updated", null);
    }
    catch(err){
        const error = new CustomError(500, "Application", "Error updating password", err);
        return next(error);
    }

}

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    // Get the user from the req. body
    const { name, email } = req.body;
    if(!name || !email) {
        const err = new CustomError(400, "General", "name and email are required", null);
        return next(err);
    }
    let user = await User.findById(req.user._id);
    // Start uploading the photo.
    try{
        let result = null;
        if(req.files){
            result = await Cloudinary.getInstance().updateUsersProfile(req.files, user.photo.id);
        }
        user = await user.updateOne({
            name,
            email,
            photo: result ? {id: result.public_id, secureUrl: result.secure_url}: user.photo
        }, {
            runValidators: true
        });
    } catch(err){
        const error = new CustomError(500, "Application", "Error while updating user", err);
        return next(error);
    }
    res.customSuccess(200, "User updated", user);
}

export const allUsers = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const users = await User.find({});
        res.customSuccess(200, "Users found", users);
    }
    catch(err){
        const error = new CustomError(500, "Application", "Error finding users", err);
        return next(error);
    }
}

export const user = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    if(!userId) {
        const err = new CustomError(400, "General", "User id is required", null);
        return next(err);
    }
    if(!mongoose.Types.ObjectId.isValid(userId)) {
        const err = new CustomError(400, "General", "User id is invalid", null);
        return next(err);
    }

    try{
        const user = await User.findById(userId);
        if(!user) {
            const err = new CustomError(400, "General", "User not found", null);
            return next(err);
        }
        res.customSuccess(200, "User found", user);
    } catch(err){
        const error = new CustomError(500, "Application", "Error finding user", err);
        return next(error);
    }
}

export const updateProfileByAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    if(!userId) {
        const err = new CustomError(400, "General", "User id is required", null);
        return next(err);
    }
    if(!mongoose.Types.ObjectId.isValid(userId)) {
        const err = new CustomError(400, "General", "User id is invalid", null);
        return next(err);
    }

    try{
        const { name, email } = req.body;
        if(!name || !email ) {
            const err = new CustomError(400, "General", "name, email and role are required", null);
            return next(err);
        }
        const user = await User.findOneAndUpdate({
            _id: userId,
        }, {
            name,
            email
        }, {
            new: true,
            runValidators: true
        });
        res.customSuccess(200, "User updated", user);
    } catch(err){
        const error = new CustomError(500, "Application", "Error occured while updating user", err);
        return next(error);
    }
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    if(!userId) {
        const err = new CustomError(400, "General", "User id is required", null);
        return next(err);
    }
    if(!mongoose.Types.ObjectId.isValid(userId)) {
        const err = new CustomError(400, "General", "User id is invalid", null);
        return next(err);
    }

    try{
        const user = await User.findById(userId);
        if(!user) {
            const err = new CustomError(400, "General", "User not found", null);
            return next(err);
        }
        if(user.role.includes("admin")) {
            const err = new CustomError(400, "General", "Cannot delete admin", null);
            return next(err);
        }
        await user.remove();
        res.customSuccess(200, "User deleted", null);
    } catch(err){
        const error = new CustomError(500, "Application", "Error occured while deleting user", err);
        return next(error);
    }
}


export const upgradeUserRoleRequest = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const rolesRequested: string[] = req.body.roles;
    const validRoles = [];
    const invalidRoles = [];
    const userRoles = [];
    logger.debug(rolesRequested);
    rolesRequested.forEach(role => {
        const availableRoles = User.schema.path("role").options.type[0].enum;
        logger.debug(availableRoles);
        if(availableRoles.includes(role)) {
            if(req.user.role.includes(role)) {
                userRoles.push(role);
            } else {
                validRoles.push(role);
            }
        } else{
            invalidRoles.push(role);
        }
    });
    logger.debug(validRoles);
    const token = crypto.randomBytes(20).toString('hex');
    await User.findByIdAndUpdate(userId, {roleChangeRequest: token});
    const url = `${req.protocol}://${req.get('host')}/api/v1/admin/updateRole/${userId}/${token}?roles=${validRoles}`;
    const approveURL = `${url}&approve=true`;
    const rejectURL = `${url}&approve=false`;

    // Send email to admin
    if(validRoles.length > 0){
        const admin = await User.findOne({ role: "admin" });
        if(admin) {
            const nodemailer: Nodemailer = new Nodemailer();
            await nodemailer.sendUserRequestForRoleChange(admin.name, admin.email, approveURL, rejectURL, req.user, validRoles);
            logger.debug("Email sent to admin", admin);
        } else {
            logger.error("Admin not found");
        }
        res.customSuccess(200, "User role request sent", {approveURL, rejectURL, validRoles, invalidRoles, userRoles});
    } else{
        res.customSuccess(200, "No valid roles", {validRoles, invalidRoles, userRoles});
    }

}

export const handleAdminResponseForRoleChange = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const rolesRequested = String(req.query.roles).split(",");
    const approve = req.query.approve;
    const token = req.params.token;
    if(!userId) {
        const err = new CustomError(400, "General", "User id is required", null);
        return next(err);
    }
    if(!mongoose.Types.ObjectId.isValid(userId)) {
        const err = new CustomError(400, "General", "User id is invalid", null);
        return next(err);
    }
    if(rolesRequested.length === 0) {
        const err = new CustomError(400, "General", "Roles are required", null);
        return next(err);
    }
    try{
        const nodemailer = new Nodemailer();
        if(approve === "true") {
            const user = await User.findOneAndUpdate({_id : userId, roleChangeRequest: token}, { "$push": { "role": { "$each": rolesRequested }}, roleChangeRequest: null}, {new: true});
            logger.info(user);
            if(user) {
                await nodemailer.sendAdminResponseForRoleChange(user.name, user.email, true);
                res.customSuccess(200, "User role updated", user);
            } else{
                res.customSuccess(200, "User role not updated, already approve rejected by our admins", user);
            }
        } else {
            const user = await User.findOneAndUpdate({_id : userId, roleChangeRequest: token}, {roleChangeRequest: null}, {new: true});
            logger.info(user);
            if(user) {
                await nodemailer.sendAdminResponseForRoleChange(user.name, user.email, false);
                res.customSuccess(200, "User role update rejected", null);
            } else {
                res.customSuccess(200, "User role Already updated", null);
            }
        }
    } catch(err){
        const error = new CustomError(500, "Application", "Error occured while updating user role", err);
        return next(error);
    }
}

export const allAdmins = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const users = await User.find({role: "admin"});
        res.customSuccess(200, "All admin", users);
    } catch(err){
        const error = new CustomError(500, "Application", "Error occured while fetching all admin", err);
        return next(error);
    }
}
