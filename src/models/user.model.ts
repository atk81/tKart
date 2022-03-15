import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import { CustomError } from "../utils/response/error";
import { JWTPayload } from "../types/jwt";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const pathToPrivateKey = path.join(__dirname, '..', '..', '.private.key');
const privateKey = fs.readFileSync(pathToPrivateKey, 'utf8');
const Schema = mongoose.Schema;

/**
 * UserSchema - Mongoose schema for the User model
 * @type {mongoose.Schema}
 * @constant UserSchema
 * @memberof Models
 */
const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        validate: [validator.isEmail, "Invalid Email"],
        // convert into lowercase
        set: (email: string) => email.toLowerCase(),
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        maxlength: [32, "Password must be at most 32 characters"],
        // Check password strength
        validate: [validator.isStrongPassword, "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"]
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    photo: {
        id: {
            type: String,
        },
        secure_url: {
            type: String,
        },
    },
    forgetPasswordToken: {
        type: String,
        default: null
    },
    forgetPasswordExpires: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

/**
 * pre-save - Encrypt password before saving
 * @param next Callback
 * @returns void
 */
UserSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    try{
       this.password = await bcrypt.hash(this.password, 12);
        next(); 
    } catch(err){
        const error = new CustomError(500, "Application", "Error encrypting password", err);
        next(error);
    }
});

/**
 * isValidPassword - Check if the password is valid
 * @param password Password to compare
 * @returns Boolean
 */
UserSchema.methods.isValidPassword = async function (password: string): Promise<boolean> {
    try{
        return await bcrypt.compare(password, this.password);
    }
    catch(err){
        const error = new CustomError(500, "Application", "Error comparing password", err);
        throw error;
    }
}

/**
 * Generate JWT token
 * @returns {string} JWT token
 */
UserSchema.methods.getJWTToken = function(): string{
    const payload: JWTPayload = {
        sub: this._id,
        iat: Date.now(),
    }
    return jwt.sign(
        payload,
        {
            key: privateKey,
            passphrase: process.env.PASSPHRASE,
        },
        {
            algorithm: 'RS256',
            expiresIn: '3 day',
        }
    );
}

/**
 * Generate Forget Password Token
 * Valid for 10 minutes
 * @returns {string} forgot password token
 */
UserSchema.methods.getForgetPasswordToken = function(): string{
    // Generate a random string and hash it
    // Save the hash password in the database
    // Send the token to the user
    const forgetToken = crypto.randomBytes(20).toString('hex');
    this.forgetPasswordToken = crypto.createHash('sha256').update(forgetToken).digest('hex');
    this.forgetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return forgetToken;
}

module.exports = mongoose.model("User", UserSchema);
