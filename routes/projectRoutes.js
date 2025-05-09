import express from "express";

// Local Modules
import { protect, restrict } from "../controller/authController.js";
import {
   createProject,
   updateProject,
   getProjectByName,
   getProjectByDuration,
   getProjectByTech,
   getProjectById,
   deleteProject,
   saveDraft,
   publishDraft,
   deleteDraft,
   getProjects,
} from "../controller/projectController.js";

const router = express.Router();

router
   .post("/create", protect, createProject)
   .post("/draft", protect, saveDraft)
   .get("/all", protect, restrict, getProjects)
   .get("/duration", getProjectByDuration)
   .get("/tech", getProjectByTech)
   .get("/name", getProjectByName)
   .get("/:id", getProjectById)
   .patch("/update/:id", protect, updateProject)
   .patch("/publish/:id", protect, publishDraft)
   .delete("/delete/:id", protect, deleteProject)
   .delete("/draft/delete/:id", protect, deleteDraft);

export default router;
