export type ErrorType = "General" | "Raw" | "Validation" | "Unautherorized" | "Application";

export type ErrorValidation = {
    [key: string]: string;
};

export type Errors = string[] | Error[] | ErrorValidation[];

export type ErrorResponse = {
    httpStatusCode: number;
    type: ErrorType;
    message: string;
    errors?: Errors;
}
