import { Router } from "express";
import { signup, signupVerify, login, logout, forgotPassword, resetPasswordByToken, dashboard, changePassword, updateProfile } from "../controllers/user.controller";
import {BigPromise} from "../middleware/bigPromise";
import UserMiddleware from "../middleware/user";
const app = Router();


app.post('/signup', BigPromise(signup));
app.get('/signup/verify/:token', BigPromise(signupVerify));
app.post("/login", BigPromise(login));
app.get("/logout", BigPromise(logout));
app.post("/forgotPassword", BigPromise(forgotPassword));
app.post("/forgotPassword/verify/:token", BigPromise(resetPasswordByToken));
app.get("/userdashboard", UserMiddleware.isLoggedIn, BigPromise(dashboard));
app.post("/changePassword", UserMiddleware.isLoggedIn, BigPromise(changePassword));
app.post("/userdashboard/update", UserMiddleware.isLoggedIn, BigPromise(updateProfile));

export { app as userRoutes };
