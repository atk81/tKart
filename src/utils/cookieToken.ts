import { IUser } from "../models/user.model";
import { Response } from "express"; 

export const cookieToken = (user: IUser, res: Response) =>{
    const token = user.getJWTToken();
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRY),
        httpOnly: true,
    }
    // Send cookie for web browser
    // Set-Cookie: token=token; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT
    // Send JSON response for mobile api
    res.cookie("token", token, options).customSuccess(200, "Success", {
        token,
        options,
        user
    });
}