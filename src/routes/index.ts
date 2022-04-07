import { Router } from "express";
import { userRoutes } from "./user";
import { productRoutes } from "./product";
import { reviewRoutes } from "./review";

const app = Router();

app.use("/api/v1", userRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", reviewRoutes);

export {app as apiRoutes};
