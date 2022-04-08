import { Router } from "express";
import { BigPromise } from "../middleware/bigPromise";
import {sendStripeKey, sendRazorpayKey, captureStripePayment, captureRazorpayPayment} from "../controllers/payment.controller";
const app = Router();
import UserMiddleware from "../middleware/user";

app.get("/stripeKey", BigPromise(UserMiddleware.isLoggedIn), BigPromise(sendStripeKey));
app.get("/razorpayKey", BigPromise(UserMiddleware.isLoggedIn), BigPromise(sendRazorpayKey));
app.post("/captureStripePayment", BigPromise(UserMiddleware.isLoggedIn), BigPromise(captureStripePayment));
app.post("/captureRazorpayPayment", BigPromise(UserMiddleware.isLoggedIn), BigPromise(captureRazorpayPayment));

export {
    app as paymentRoutes
};
