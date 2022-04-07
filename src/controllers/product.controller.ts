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

export const updateProduct = async(req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if(!product){
            return res.customSuccess(404, "Product not found", null);
        }
        if(product.productOwner.toString() !== req.user.id){
            return res.customSuccess(403, "You are not authorized to update this product", null);
        }
        // Since we are iterating over the keys of the product object, we need to check if the key that is being passed in
        // in request body should be modified as product schema.
        // For ex. photos passed in the req. body is not equivalent to photos in the product schema.
        
        // Modifying the photos schema.
        if(req.files){
            const result = await Cloudinary.getInstance().uploadProductPhotos(req.files);
            const photos = [];
            result.forEach(photo=>{
                photos.push({
                    id: photo.public_id,
                    secure_url: photo.secure_url,
                });
            });
            req.body.photos = [...product.photos, ...photos];
            logger.debug(photos);
        }
        // Iterate over Product fields and update them if they are present in the request body.
        for(const field in req.body){
            if(product.schema.obj[field]){
                logger.debug(`Updating ${field}`);
                product[field] = req.body[field];
            }
        }
        const updatedProduct = await product.save();
        res.customSuccess(200, "Product updated successfully.", updatedProduct);
    } catch(err){
        logger.error(err);
        next(new CustomError(500, "Application", "Internal server error", err));
    }
}

export const deleteProductPhotos = async(req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if(!product){
            return res.customSuccess(404, "Product not found", null);
        }
        if(product.productOwner.toString() !== req.user.id){
            return res.customSuccess(403, "You are not authorized to update this product", null);
        }
        const photos = product.photos;
        const photoIds = req.body.photos;
        if(!photoIds){
            return res.customSuccess(400, "Please provide the photo ids to delete", null);
        }
        const photosToDelete = photos.filter(photo=>{
            return photoIds?.includes(photo.id);
        });
        photosToDelete.forEach(photo=>{
            Cloudinary.getInstance().deleteProudctPhoto(photo.id);
        });
        product.photos = photos.filter(photo=>{
            return !photoIds.includes(photo.id);
        });
        const updatedProduct = await product.save();
        res.customSuccess(200, "Product updated successfully.", updatedProduct);
    } catch(err){
        logger.error(err);
        next(new CustomError(500, "Application", "Internal server error", err));
    }
}

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    try {
        const product = await Product.findById(id);
        if(product.productOwner.toString() !== req.user.id){
            const err = new CustomError(403, "General", "You are not authorized to delete this product", null);
            return next(err);
        }
        if(!product){
            const err = new CustomError(404, "General", "Product not found", null);
            return next(err);
        }
        // Remove all the photos from the cloudinary
        product.photos.forEach(photo=>{
            Cloudinary.getInstance().deleteProudctPhoto(photo.id);
        });
        await product.remove();
        res.customSuccess(200, "Product deleted successfully.", null);
    } catch(err){
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

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const product = await Product.findById(req.params.id);
        if(!product){
            return res.customSuccess(404, "Product not found.", null);
        }
        res.customSuccess(200, "Product fetched successfully.", product);
    } catch(err){
        logger.error(err);
        next(new CustomError(500, "Application", "Internal server error", err));
    }
}

