import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { logger } from "../logger";
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
        const order = new Order({
            user: userId,
            products: {
                items: productsInOrder,
            },
            total: convertIntoDoubleDecimal(cartTotal),
            payment: payment_id,
        });
        const newOrder = await order.save();
        // On Success, clear the cart
        user.cart = {} as any;
        const updatedUser = await user.save();
        return res.customSuccess(201, "Order created", {
            order: newOrder,
            user: updatedUser,
        });
    } catch(err){
        logger.error(err);
        return next(new CustomError(500, "General", "Error while creating order, Retry",err));
    }
}

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    try{
        const orders = await Order.find({user: userId});
        if (!orders) {
            return next(new CustomError(404, "General", "Orders not found",null));
        }
        return res.customSuccess(200, "Orders retrieved successfully", orders);
    }
    catch(err){
        return next(new CustomError(500, "General", "Error while retrieving orders, Retry",err));
    }
}

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const orderId = req.params.id;
    /*  
        req.body: { 
            products: [{
                product: "5e9f8f8f8f8f8f8f8f8f8f8",
            }, {
                product: "5e9f8f8f8f8f8f8f8f8f8f9",
            }] 
    */
    const { products } = req.body;
    try{
        const order = await Order.findById(orderId);
        if (!order) {
            return next(new CustomError(404, "General", "Order not found",null));
        }
        if (order.user.toString() !== userId) {
            return next(new CustomError(401, "General", "User is not authorized to cancel this order",null));
        }
        // order.status = "cancelled";
        for(const product in products) {
            const productId = product;
            for(let index = 0; index < order.products.items.length; index++) {
                if (order.products.items[index].product.toString() === productId) {
                    order.products.items[index].orderStatus = "cancelled";
                    // TODO: Start for refund...
                }
            }
        }
        const updatedOrder = await order.save();
        return res.customSuccess(200, "Order cancelled successfully", updatedOrder);
    }
    catch(err){
        return next(new CustomError(500, "General", "Error while cancelling order, Retry",err));
    }
}

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const orderId = req.params.id;
    try{
        const order = await Order.findOne({user: userId, _id: orderId});
        if (!order) {
            return next(new CustomError(404, "General", "Order not found",null));
        }
        return res.customSuccess(200, "Order retrieved successfully", order);
    }
    catch(err){
        return next(new CustomError(500, "General", "Error while retrieving order, Retry",err));
    }
}

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const orders = await Order.find();
        if (!orders) {
            return next(new CustomError(404, "General", "Orders not found",null));
        }
        return res.customSuccess(200, "Orders retrieved successfully", orders);
    }
    catch(err){
        return next(new CustomError(500, "General", "Error while retrieving orders, Retry",err));
    }
}

export const getOrderByAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id;
    try{
        const order = await Order.findById(orderId);
        if (!order) {
            return next(new CustomError(404, "General", "Order not found",null));
        }
        return res.customSuccess(200, "Order retrieved successfully", order);
    }
    catch(err){
        return next(new CustomError(500, "General", "Error while retrieving order, Retry",err));
    }
}

