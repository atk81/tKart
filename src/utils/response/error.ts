import { ErrorResponse, Errors, ErrorType } from "./error.d";
import mongoose from "mongoose";
export class CustomError extends Error{
    private httpStatusCode: number;
    private errorType: ErrorType;
    private errors: Errors;
    /**
     * Create a new custom error
     * @param httpStatusCode HTTP status code
     * @param errorType Error type - @errorType
     * @param message Error message
     * @param errors Error details
     */
    constructor(httpStatusCode: number, errorType: ErrorType, message: string, errors: Errors){
        if(errors["name"]==="MongoServerError" && errors["code"]===11000){
            httpStatusCode = 400;
            errorType = "Validation";
            message = "Duplicate data on unique field";
        }
        // // Mongoose Validation error
        if(errors instanceof mongoose.Error.ValidationError){
            errorType = "Validation";
            httpStatusCode = 400;
            message = errors.message;
        }

        super(message);
        this.name = this.constructor.name;
        this.httpStatusCode = httpStatusCode;
        this.errorType = errorType;
        this.errors = errors;
    }

    /**
     * Get the error response
     * @returns ErrorResponse
    */
    get HttpStatusCode(): number{
        return this.httpStatusCode;
    }

    /**
     * Get the error response in JSON format
     * @returns ErrorResponse
     */
    get JSON(): ErrorResponse{
        return {
            httpStatusCode: this.httpStatusCode,
            type: this.errorType,
            message: this.message,
            errors: this.errors
        }
    }
}
