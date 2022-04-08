import Stripe from "stripe";
import Razorpay from "razorpay";
import { nanoid } from "nanoid";
import { Request, Response } from "express";

export const sendStripeKey = (req: Request, res: Response) => {
    res.status(200).json({
        stripeKey: process.env.STRIPE_PUBLIC_KEY
    });
}

export const captureStripePayment = async (req: Request, res: Response) => {
    const { amount } = req.body;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {apiVersion: "2020-08-27"});
    const intent = await stripe.paymentIntents.create({
        currency: "inr",
        amount: amount,
        metadata: {
            uid: req.user.id,
            integration_check: "accept_a_payment"
        }
    });
    res.status(200).json({
        clientSecret: intent.client_secret
    });
}

export const sendRazorpayKey = (req: Request, res: Response) => {
    res.status(200).json({
        razorpayKey: process.env.RAZORPAY_PUBLIC_KEY
    });
}

export const captureRazorpayPayment = async (req: Request, res: Response) => {
    const { amount } = req.body;
    const instance = new Razorpay({ 
        key_id: process.env.RAZORPAY_API_KEY, 
        key_secret: process.env.RAZORPAY_SECRET_KEY 
    });

    const intent = instance.orders.create({
    amount: amount,
    currency: "INR",
    receipt: nanoid(),
    });

    res.status(200).json({
        clientSecret: intent.id
    });
}
