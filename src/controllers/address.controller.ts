import { NextFunction, Request, Response } from "express";
import { IAddress } from "../models/address.model";
import User from "../models/user.model";
import { CustomError } from "../utils/response/error";

export const addAddress = async(req: Request, res: Response, next: NextFunction) => {
    const userId = req?.user?._id;  
    // console.log(userId);
    const address: IAddress = req.body;
    if (!userId) {
        return next(new CustomError(401, "General", "User is not logged in",null));
    }
    if (!address) {
        return next(new CustomError(400, "General", "Address is not provided",null));
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return next(new CustomError(404, "General", "User not found",null));
        }
        user.addresses.push(address);
        const updatedUser = await user.save();
        return res.customSuccess(201, "Address added", updatedUser.addresses);
    } catch(err){
        return next(new CustomError(500, "General", "Error while adding address, Retry",err));
    }
}


export const updateAddress = async(req: Request, res: Response, next: NextFunction) => {
    const userId = req?.user?._id;
    const addressId = req.params.id;
    const address: IAddress = req.body;
    if (!userId) {
        return next(new CustomError(401, "General", "User is not logged in",null));
    }
    if (!address) {
        return next(new CustomError(400, "General", "Address is not provided",null));
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return next(new CustomError(404, "General", "User not found",null));
        }
        const index = user.addresses.findIndex(item => item._id.toString() === addressId);
        if (index === -1) {
            return next(new CustomError(404, "General", "Address not found",null));
        }
        user.addresses[index] = address;
        const updatedUser = await user.save();
        return res.customSuccess(201, "Address updated", updatedUser.addresses);
    } catch(err){
        return next(new CustomError(500, "General", "Error while updating address, Retry",err));
    }
}

export const deleteAddress = async(req: Request, res: Response, next: NextFunction) => {
    const userId = req?.user?._id;
    const addressId = req.params.id;
    if (!userId) {
        return next(new CustomError(401, "General", "User is not logged in",null));
    }
    if (!addressId) {
        return next(new CustomError(400, "General", "Address is not provided",null));
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return next(new CustomError(404, "General", "User not found",null));
        }
        const index = user.addresses.findIndex(item => item._id.toString() === addressId);
        if (index === -1) {
            return next(new CustomError(404, "General", "Address not found",null));
        }
        user.addresses.splice(index, 1);
        const updatedUser = await user.save();
        return res.customSuccess(201, "Address deleted", updatedUser.addresses);
    } catch(err){
        return next(new CustomError(500, "General", "Error while deleting address, Retry",err));
    }
}
