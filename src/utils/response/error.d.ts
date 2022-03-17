import mongoose from "mongoose";

export type ErrorType = "General" | "Raw" | "Validation" | "Unautherorized" | "Application";

export type ErrorValidation = mongoose.Error.ValidationError;

export type Errors = string[] | Error[] | ErrorValidation[];

export type ErrorResponse = {
    httpStatusCode: number;
    type: ErrorType;
    message: string;
    errors?: Errors;
}
