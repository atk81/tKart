import { Router } from "express";
import { addProduct, getProducts, getProduct, updateProduct, deleteProductPhotos, deleteProduct } from "../controllers/product.controller";
import {BigPromise} from "../middleware/bigPromise";
import UserMiddleware from "../middleware/user";
const app = Router();

app.post("/product/add", UserMiddleware.isLoggedIn, UserMiddleware.customRoles("vendor"), BigPromise(addProduct));
app.put("/product/:id", UserMiddleware.isLoggedIn, UserMiddleware.customRoles("admin", "vendor"), BigPromise(updateProduct));
app.put("/product/:id/deletePhotos", UserMiddleware.isLoggedIn, UserMiddleware.customRoles("admin", "vendor"), BigPromise(deleteProductPhotos));
app.delete("/product/:id", UserMiddleware.isLoggedIn, UserMiddleware.customRoles("vendor", "admin"), BigPromise(deleteProduct));
app.get("/products",BigPromise(getProducts));
app.get("/product/:id", BigPromise(getProduct));

export { app as productRoutes };
