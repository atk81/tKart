import { Router } from "express";
import { signup, signupVerify, login, logout, forgotPassword } from "../controllers/user.controller";
import {BigPromise} from "../middleware/bigPromise";
const app = Router();


app.post('/signup', BigPromise(signup));
app.get('/signup/verify/:token', BigPromise(signupVerify));
app.post("/login", BigPromise(login));
app.get("/logout", BigPromise(logout));
app.post("/forgotPassword", BigPromise(forgotPassword));

export { app as userRoutes };
