import { Router } from "express";
import { signup, signupVerify, login, logout, forgotPassword, resetPasswordByToken, dashboard, 
    changePassword, updateProfile, allUsers, user, updateProfileByAdmin, deleteUser, upgradeUserRoleRequest,
    handleAdminResponseForRoleChange, allAdmins } from "../controllers/user.controller";
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
app.get("/admin/allusers",UserMiddleware.isLoggedIn, UserMiddleware.customRoles("admin"), BigPromise(allUsers));
app.get("/admin/user/:id",UserMiddleware.isLoggedIn, UserMiddleware.customRoles("admin"), BigPromise(user));
app.put("/admin/user/:id",UserMiddleware.isLoggedIn, UserMiddleware.customRoles("admin"), BigPromise(updateProfileByAdmin));
app.delete("/admin/user/:id",UserMiddleware.isLoggedIn, UserMiddleware.customRoles("admin"), BigPromise(deleteUser));
app.post("/user/upgradeUserRoleRequest", UserMiddleware.isLoggedIn, BigPromise(upgradeUserRoleRequest));
app.get("/admin/updateRole/:id/:token", UserMiddleware.isLoggedIn, UserMiddleware.customRoles("admin"), BigPromise(handleAdminResponseForRoleChange));
app.get("/admin/alladmins", UserMiddleware.isLoggedIn, UserMiddleware.customRoles("admin"), BigPromise(allAdmins));

export { app as userRoutes };
