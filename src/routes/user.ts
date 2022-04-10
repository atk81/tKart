import { Router } from "express";
import { addAddress, deleteAddress, updateAddress } from "../controllers/address.controller";
import { allAdmins, allUsers, changePassword, dashboard, deleteUser, forgotPassword, handleAdminResponseForRoleChange, login, logout, resetPasswordByToken, signup, signupVerify, updateProfile, updateProfileByAdmin, upgradeUserRoleRequest, user } from "../controllers/user.controller";
import { BigPromise } from "../middleware/bigPromise";
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
app.get("/admin/updateRole/:id/:token", BigPromise(handleAdminResponseForRoleChange));
app.get("/admin/alladmins", UserMiddleware.isLoggedIn, UserMiddleware.customRoles("admin"), BigPromise(allAdmins));

app.post("/user/addAddress", UserMiddleware.isLoggedIn, BigPromise(addAddress));
app.put("/user/updateAddress/:id", UserMiddleware.isLoggedIn, BigPromise(updateAddress));
app.delete("/user/deleteAddress/:id", UserMiddleware.isLoggedIn, BigPromise(deleteAddress));

export { app as userRoutes };
