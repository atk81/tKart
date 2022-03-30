import { Router } from "express";
import { signup, signupVerify, login, logout, forgotPassword, resetPasswordByToken, dashboard } from "../controllers/user.controller";
import {BigPromise} from "../middleware/bigPromise";
import UserMiddleware from "../middleware/user";
const app = Router();


app.post('/signup', BigPromise(signup));
app.get('/signup/verify/:token', BigPromise(signupVerify));
app.post("/login", BigPromise(login));
app.get("/logout", BigPromise(logout));
app.post("/forgotPassword", BigPromise(forgotPassword));
app.post("/forgotPassword/verify/:token", BigPromise(resetPasswordByToken));
app.get("/dashboard", UserMiddleware.isLoggedIn, BigPromise(dashboard));

export { app as userRoutes };
