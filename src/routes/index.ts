import { Router } from "express";
import { userRoutes } from "./user";
import { productRoutes } from "./product";

const app = Router();

app.use("/api/v1", userRoutes);
app.use("/api/v1", productRoutes);

export {app as apiRoutes};
