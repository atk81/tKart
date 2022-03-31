/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../utils/response/error";

export const errorHandler = (err: CustomError, req: Request, res: Response, _next: NextFunction) => {
    return res.status(err.HttpStatusCode).json(err.JSON);
}
