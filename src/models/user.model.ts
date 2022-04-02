import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import jwt from "jsonwebtoken";
import { Document, model, Schema } from "mongoose";
import path from "path";
import validator from "validator";
import { JWTPayload } from "../types/jwt";
import { CustomError } from "../utils/response/error";

const pathToPrivateKey = path.join(__dirname, '..', '..', '.private.key');
const privateKey = fs.readFileSync(pathToPrivateKey, 'utf8');

/**
 * User Schema interface
 */
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    status?: string;
    role?: string;
    photo?: {
        id: string;
        secure_url: string;
    };
    confirmUserToken?: string;
    confirmUserExpires?: Date;
    forgetPasswordToken?: string;
    forgetPasswordExpires?: Date;
    createdAt: Date;
    isValidPassword(password: string): Promise<boolean>;
    getJWTToken(): string;
    generateForgetPasswordToken(): string;
    resetForgetPasswordToken(): void;
}

/**
 * UserSchema - Mongoose schema for the User model
 * @type {mongoose.Schema}
 * @constant UserSchema
 * @memberof Models
 */
const UserSchema = new Schema<IUser>({
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
        select: false, // Hide the password on query, update, and find, but not on save
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        maxlength: [32, "Password must be at most 32 characters"],
        // Check password strength
        validate: [validator.isStrongPassword, "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"]
    },
    status: {
        type: String,
        enum: ["active", "pending"],
        default: "pending"
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
    confirmUserToken: {
        type: String,
    },
    confirmUserExpires: {
        type: Date,
    },
    forgetPasswordToken: {
        type: String,
    },
    forgetPasswordExpires: {
        type: Date,
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
UserSchema.pre("save", function (next) {
    const user = this as IUser;
    if (!user.isModified("password")) {
        return next();
    }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});

// TODO: Add a pre-hook on update to validate the schema.
// UserSchema.pre("updateOne", function (next) {
//     this.validateSync(next);
//     next();
// });

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
UserSchema.methods.generateForgetPasswordToken = function(): string{
    // Generate a random string and hash it
    // Save the hash password in the database
    // Send the token to the user
    const forgetToken = crypto.randomBytes(20).toString('hex');
    this.forgetPasswordToken = crypto.createHash('sha256').update(forgetToken).digest('hex');
    this.forgetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return forgetToken;
}

/**
 * Reset all the forget password fields
 */
UserSchema.methods.resetForgetPasswordToken = function(): void{
    this.forgetPasswordToken = undefined;
    this.forgetPasswordExpires = undefined;
}

const User = model<IUser>("User", UserSchema);

export default User;
