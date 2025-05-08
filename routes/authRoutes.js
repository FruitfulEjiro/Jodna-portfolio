import express from "express";

// Local Modules
import {
   signup,
   login,
   logout,
   protect,
   restrict,
   createAdmin,
   loginAdmin,
   forgotPassword,
   resetPassword,
   updatePassword,
   updateAdminPassword,
} from "../controller/authController.js";

const router = express.Router();

router
   .post("/admin/create", createAdmin)
   .post("/admin/login", loginAdmin)
   .post("/signup", signup)
   .post("/login", login)
   .post("/forgot-password", forgotPassword)
   .post("/reset-password/:token", resetPassword)
   .patch("/update-admin-password/:id", protect, restrict, updateAdminPassword)
   .patch("/update-password/:id", protect, updatePassword)
   .get("/logout", logout);

export default router;
