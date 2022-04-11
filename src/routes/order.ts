import { Router } from "express";
import { addToCart, createOrder, getCart, getOrders, getOrder, getAllOrders, getOrderByAdmin, cancelOrder } from "../controllers/order.controllers";
import { BigPromise } from "../middleware/bigPromise";
import UserMiddleware from "../middleware/user";
const app = Router();

app.post("/product/:id/addtocart", BigPromise(UserMiddleware.isLoggedIn), BigPromise(addToCart));
app.get("/user/cart", BigPromise(UserMiddleware.isLoggedIn), BigPromise(getCart));
app.post("/user/createOrder", BigPromise(UserMiddleware.isLoggedIn), BigPromise(createOrder));
app.get("/user/orders", BigPromise(UserMiddleware.isLoggedIn), BigPromise(getOrders));
app.get("/user/order/:id", BigPromise(UserMiddleware.isLoggedIn), BigPromise(getOrder));
app.post("/user/order/:id/cancelled", BigPromise(UserMiddleware.isLoggedIn), BigPromise(cancelOrder));
app.get("/admin/getOrders", BigPromise(UserMiddleware.isLoggedIn), BigPromise(UserMiddleware.customRoles("admin")), BigPromise(getAllOrders));
app.get("/admin/getOrder/:id", BigPromise(UserMiddleware.isLoggedIn), BigPromise(UserMiddleware.customRoles("admin")), BigPromise(getOrderByAdmin));


export {
    app as orderRouter,
};
