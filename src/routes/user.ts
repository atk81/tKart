import { Router } from "express";
import { signup, signupVerify } from "../controllers/user.controller";
import {BigPromise} from "../middleware/bigPromise";
const app = Router();


app.post('/signup', BigPromise(signup));
app.get('/signup/verify/:token', BigPromise(signupVerify));

export { app as userRoutes };
