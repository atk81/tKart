import { Router } from "express";
import { signup } from "../controllers/user.controller";
import {BigPromise} from "../middleware/bigPromise";
const app = Router();


app.post('/signup', BigPromise(signup));

export { app as userRoutes };
