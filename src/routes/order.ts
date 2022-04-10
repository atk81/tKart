import { Router } from "express";
import { addToCart, createOrder, getCart } from "../controllers/order.controllers";
import { BigPromise } from "../middleware/bigPromise";
import UserMiddleware from "../middleware/user";
const app = Router();

app.post("/product/:id/addtocart", BigPromise(UserMiddleware.isLoggedIn), BigPromise(addToCart));
app.get("/user/cart", BigPromise(UserMiddleware.isLoggedIn), BigPromise(getCart));
app.post("/user/createOrder", BigPromise(UserMiddleware.isLoggedIn), BigPromise(createOrder));

export {
    app as orderRouter,
};
