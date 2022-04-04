import { NextFunction, Request, Response } from "express";
import { Cloudinary } from "../config/cloudinary.config";
import { logger } from "../logger";
import Product, { IProduct } from "../models/product.model";
import { CustomError } from "../utils/response/error";
import WhereClause from "../utils/whereClause";


export const addProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { name, price, discription, category, brand } = req.body;
    if(!name || !price || !discription || !category || !brand){
        return res.customSuccess(400, "Please fill all the fields", null);
    }
    const product: IProduct = new Product({
        name,
        price,
        discription,
        category,
        brand,
        productOwner: req.user.id,
        createdAt: new Date(),
    });
    // Upload the image to the cloudinary
    try {
        if(req.files){
            const result = await Cloudinary.getInstance().uploadProductPhotos(req.files);
            const photos = [];
            result.forEach(photo=>{
                photos.push({
                    id: photo.public_id,
                    secure_url: photo.secure_url,
                });
            });
            product.photos = photos;
            logger.debug(photos);
        } 
    } catch(err){
        logger.error(err);
        return next(new CustomError(500, "Application", "Error while uploading photos-Internal server error", err));
    }

    // Save the product to the database.
    try {
        const newProduct =await product.save();
        res.customSuccess(201, "Product added successfully.", newProduct);
    }
    catch(err){
        logger.error(err);
        next(new CustomError(500, "Application", "Internal server error", err));
    }
}

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const products =await new WhereClause<IProduct>(Product.find(), req.query).search().filter().pager(1);
        const productsAll = await products.base;
        logger.debug(productsAll);

        res.customSuccess(200, "Products fetched successfully.", productsAll);
    } catch(err){
        logger.error(err);
        next(new CustomError(500, "Application", "Internal server error", err));
    }
}

