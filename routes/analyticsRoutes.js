import express from "express";

// Local Modules
import {
   getMostUsedTech,
   getMostSearchedTech,
   getProjectCreatedIn,
   getHighestViewedProject,
   getHighestViewedTech,
   getUniqueViewers,
} from "../controller/analyticsController.js";
import { protect, restrict } from "../controller/authController.js";

const router = express.Router();

router.use(protect);

router
   .get("/most-used-tech", getMostUsedTech)
   .get("/most-searched-tech", getMostSearchedTech)
   .get("/project-created-within", getProjectCreatedIn)
   .get("/most-viewed-project", getHighestViewedProject)
   .get("/most-viewed-tech", getHighestViewedTech)
   .get("/unique-viewers/:id", restrict, getUniqueViewers);

export default router;
