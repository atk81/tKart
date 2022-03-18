import { Router } from "express";
import { userRoutes } from "./user";

const app = Router();

app.use("/api/v1", userRoutes);

export {app as apiRoutes};
