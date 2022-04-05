import User from "../models/user.model";
import { Request, Response, NextFunction } from "express";
import { verifyJWT } from "../utils/verifyJWT";
import { CustomError } from "../utils/response/error";

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

    public customRoles(...roles: string[]) {
        return (req: Request, res: Response, next: NextFunction) => {
            if(!roles.some(role => req.user.role.includes(role))) {
                const err = new CustomError(403, "General", "You don't have permission to access this resource",null);
                return next(err);
            }
            next();
        }
    }
}

export default new UserMiddleware();
