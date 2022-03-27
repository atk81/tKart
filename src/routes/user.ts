import { Router } from "express";
import { signup, signupVerify, login, logout } from "../controllers/user.controller";
import {BigPromise} from "../middleware/bigPromise";
const app = Router();


app.post('/signup', BigPromise(signup));
app.get('/signup/verify/:token', BigPromise(signupVerify));
app.post("/login", BigPromise(login));
app.get("/logout", BigPromise(logout));

export { app as userRoutes };
