import express from "express";

// Local Modules
import { updateUser, deleteUser, updateAdmin, deleteAdmin } from "../controller/userController.js";
import { protect, restrict } from "../controller/authController.js";

const router = express.Router();

router.use(protect);

router
   .patch("/update", updateUser)
   .patch("/admin/update", restrict, updateAdmin)
   .delete("/delete", deleteUser)
   .delete("/admin/delete", restrict, deleteAdmin);

export default router;
