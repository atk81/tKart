import { Router } from "express";
import { BigPromise } from "../middleware/bigPromise";
import { addreview, getreviews, removereview } from "../controllers/review.controller";

const app = Router();
import UserMiddleware from "../middleware/user";

app.post("/product/:id/addreview", UserMiddleware.isLoggedIn, BigPromise(addreview));
app.delete("/product/:id/removereview", UserMiddleware.isLoggedIn, BigPromise(removereview));
app.get("/product/:id/reviews", BigPromise(getreviews));

export { app as reviewRoutes };