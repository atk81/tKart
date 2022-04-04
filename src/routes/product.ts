import { Router } from "express";
import { addProduct, getProducts } from "../controllers/product.controller";
import {BigPromise} from "../middleware/bigPromise";
import UserMiddleware from "../middleware/user";
const app = Router();

app.post("/product/add", UserMiddleware.isLoggedIn, BigPromise(addProduct));
app.get("/products",BigPromise(getProducts));

export { app as productRoutes };

