import { ErrorType, Errors, ErrorResponse } from "./error.d";

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