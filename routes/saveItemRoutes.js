import express from "express";

// Local Modules
import { protect } from "../controller/authController.js";
import { saveItem, getSavedItems, unsaveItem } from "../controller/saveItemController.js";

const router = express.Router();

router.use(protect);

router.post("/save/:id", saveItem).get("/all", getSavedItems).delete("/delete/:id", unsaveItem);

export default router;
