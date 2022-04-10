import { Router } from "express";
import { orderRouter } from "./order";
import { paymentRoutes } from "./payment";
import { productRoutes } from "./product";
import { reviewRoutes } from "./review";
import { userRoutes } from "./user";

const app = Router();

app.use("/api/v1", userRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", reviewRoutes);
app.use("/api/v1", paymentRoutes);
app.use("/api/v1", orderRouter);

export { app as apiRoutes };

