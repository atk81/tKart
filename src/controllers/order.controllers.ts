import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { IAddress } from "../models/address.model";
import Order from "../models/order.model";
import Product, { IProduct } from "../models/product.model";
import User from "../models/user.model";
import { convertIntoDoubleDecimal } from "../utils/mathOperation";
import { CustomError } from "../utils/response/error";


export const addToCart = async(req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;
    const quantity: number = req.body.quantity;  // Quantity can be positive or negative, positive means add to cart, negative means remove from cart  
    const userId = req?.user?._id;
    const id = new mongoose.Types.ObjectId(productId);
    if (!userId) {
        return next(new CustomError(401, "General", "User is not logged in",null));
    }
    if (!productId || !quantity) {
        return next(new CustomError(400, "General", "Product id or quantity is not provided",null));
    }
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return next(new CustomError(404, "General", "Product not found",null));
        }
        const user =await User.findById(userId);
        const totalCartValue = user.cart.total;
        if (!user) {
            return next(new CustomError(404, "General", "User not found",null));
        }
        // Check if the product is already in the cart, if so, update the quantity
        const index = user.cart.items.findIndex(item => item.product.toString() === productId);
        // If not found, add the product to the cart, if the quantity is negative, return an error
        if (index === -1) {
            if(quantity < 0) {
                return next(new CustomError(400, "General", "Product doesn't exits in your cart",null));
            } else {
                user.cart.items.push({
                    product: id,
                    quantity: quantity,
                });
            }
        } else {
            // Get the current quantity of the product in the cart
            const currentQuantity = user.cart.items[index].quantity;
            if(quantity + currentQuantity < 0){
                return next(new CustomError(400, "General", "Product Quantity is not correct, please check your cart",null));
            } else if(quantity + currentQuantity === 0) {
                user.cart.items.splice(index, 1);
                user.cart.total = totalCartValue + (product.price * quantity);
            } else {
                user.cart.items[index] = {
                    product: id,
                    quantity: quantity + currentQuantity,
                };
            }
        }
        user.cart.total = Math.round((totalCartValue + (product.price * quantity)+ Number.EPSILON) * 100) / 100;
        const updatedUser = await user.save();
        return res.customSuccess(201, "Product added to cart", updatedUser.cart);
    } catch(err){
        return next(new CustomError(500, "General", "Error while adding product to cart, Retry",err));
    }
}

export const getCart = async(req: Request, res: Response, next: NextFunction) => {
    const userId = req?.user?._id;
    if (!userId) {
        return next(new CustomError(401, "General", "User is not logged in",null));
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return next(new CustomError(404, "General", "User not found",null));
        }
        return res.customSuccess(200, "Cart retrieved successfully", user.cart);
    } catch(err){
        return next(new CustomError(500, "General", "Error while retrieving cart, Retry",err));
    }
}

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req?.user?._id;
    // For the body we need to have the product_id and quantiy, for example:
    /*
        req.body: {
            items: [{
                product: "5e9f8f8f8f8f8f8f8f8f8f8",
                quantity: 1,
                address: "5e9f8f8f8f8f8f8f8f8f8f8"
            },
            {
                product: "5e9f8f8f8f8f8f8f8f8f8f9",
                quantity: 2,
                address: "5e9f8f8f8f8f8f8f8f8f8f9"
            }],
            payment_id : "5e9f8f8f8f8f8f8f8f8f8f8"
        }
    */

    const products = req.body.items;
    const payment_id = req.body.payment_id;
    if (!userId) {
        return next(new CustomError(401, "General", "User is not logged in",null));
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return next(new CustomError(404, "General", "User not found",null));
        }
        let cartTotal = 0;
        const productsInOrder = [];
        for(const product of products) {
            const productId = product.product;
            const quantity = product.quantity;
            const addressId = product.address;
            const originalProduct: IProduct =await Product.findById(productId);
            if (!originalProduct) {
                return next(new CustomError(404, "General", "Product not found",null));
            }
            const address: IAddress =await user.addresses.find(address => address._id.toString() === addressId);
            if (!address) {
                return next(new CustomError(404, "General", "Address not found",null));
            }
            const cartSubtotal = originalProduct.price * quantity;
            cartTotal = cartTotal + cartSubtotal;
            productsInOrder.push({
                product: originalProduct._id,
                name: originalProduct.name,
                price: originalProduct.price,
                quantity: quantity,
                total: cartSubtotal,
                deliveryAddress: address,
            });
        }
        // !Bug: Products are not saving into the order Schema.
        const newOrder = await Order.create({
            user: userId,
            products: productsInOrder,
            total: convertIntoDoubleDecimal(cartTotal),
            payment: payment_id,
        });
        // On Success, clear the cart
        user.cart = {} as any;
        const updatedUser = await user.save();
        return res.customSuccess(201, "Order created", {
            order: newOrder,
            user: updatedUser,
        });
    } catch(err){
        console.log(err);
        return next(new CustomError(500, "General", "Error while creating order, Retry",err));
    }
}
