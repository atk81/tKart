import {Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Product, { IProduct } from "../models/product.model";
import Review from "../models/review.model";
import { CustomError } from "../utils/response/error";

export const addreview =async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;
    const userId = req.user._id;
    const { rating, comment } = req.body;
    if(!rating || !comment) {
        return next(new CustomError(400,"General", "Rating and comment are required", null));
    }
    try {    // Check if the user has already reviewed the product
        const review = await Review.findOne({ user: userId, product: productId });
        const product = await Product.findById(productId);
        if(userId === product.productOwner.toString()) {
            return next(new CustomError(400,"General", "You cannot review your own product", null));
        }
        if (review) {
            review.rating = rating;
            review.comment = comment;
            const updateReview = await Review.findByIdAndUpdate(review._id,{ $set: {rating: rating, comment: comment} },{new: true});
            const updatedProduct = await Product.findByIdAndUpdate(product._id, {$inc: {rating: (rating - product.rating)/product.numberofreviews}}, {new: true});
            return res.customSuccess(200, "Review updated", {review: updateReview, product: updatedProduct});
        }
        const newReview = new Review({
            user:new mongoose.Types.ObjectId(userId),
            product:new mongoose.Types.ObjectId(productId),
            rating: rating,
            comment: comment
        });
        const result = await newReview.save();
        // product.numberofreviews++;
        // product.rating = product.rating + (rating - product.rating) / product.numberofreviews;
        // product.reviews.push(result._id);
        // const updatedProduct = await product.save({new: true});
        const updatedProduct = await Product.findByIdAndUpdate(productId, {$inc: {numberofreviews: 1, rating: (rating - product.rating)/(product.numberofreviews+1)}, $set:{reviews: [...product.reviews, result._id]}}, {new: true});
        res.customSuccess(201, "Review added", {product: updatedProduct, review: result});
    } catch(err) {
        const error = new CustomError(500, "Application", "Error adding review", err);
        next(error);
    }
}

export const removereview = async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;
    const userId = req.user._id;
    try {
        const review = await Review.findOne({ user: userId, product: productId });
        if (!review) {
            return next(new CustomError(404, "General", "Review not found", null));
        }
        const product: IProduct = await Product.findById(productId);
        if(userId === product.productOwner.toString()) {
            return next(new CustomError(400,"General", "You cannot delete review of our own product", null));
        }
        const result = await review.remove();
        product.numberofreviews--;
        if(product.numberofreviews === 0) {
            product.rating = 0;
        }
        else {
            product.rating = product.rating - (review.rating - product.rating) / product.numberofreviews;
        }
        for(const review of product.reviews) {
            if(review.toString() === result._id.toString()) {
                product.reviews.splice(product.reviews.indexOf(review), 1);
                break;
            }
        }
        const updatedProduct = await product.save();
        res.customSuccess(200, "Review removed", {product: updatedProduct, review: result});
    } catch(err) {
        const error = new CustomError(500, "Application", "Error removing review", err);
        next(error);
    }
}

export const getreviews = async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;
    try {
        const reviews = await Review.find({ product: productId });
        res.customSuccess(200, "Reviews found", reviews);
    } catch(err) {
        const error = new CustomError(500, "Application", "Error getting reviews", err);
        next(error);
    }
}
