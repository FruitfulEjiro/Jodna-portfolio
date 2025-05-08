import express from "express";

// Local Modules
import { getMostUsedTech } from "../controller/analyticsController.js";

const router = express.Router();

router.get("/most-used-tech", getMostUsedTech);

export default router;
