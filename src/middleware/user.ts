import User from "../models/user.model";
import { Request, Response, NextFunction } from "express";
import { verifyJWT } from "../utils/verifyJWT";

class UserMiddleware {
    public async isLoggedIn(req: Request, res: Response, next: NextFunction) {
        // Get the token from the header/cookie
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

        if(!token) {
            return res.customSuccess(401, "Unauthorized", {});
        }

        try{
            const decode = await verifyJWT(token);
            if(!decode) {
                return res.customSuccess(401, "Unauthorized", {});
            }
            const user = await User.findById(decode.sub);
            if(!user) {
                return res.customSuccess(401, "Unauthorized", {});
            }
            req.user = user;
            next(); 
        } catch(err) {
            return res.customSuccess(401, "Unauthorized", {});
        }  
    }
}

export default new UserMiddleware();
