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
   getProjectByUser,
   getProjectByOwnUser,
   getDrafts,
} from "../controller/projectController.js";

const router = express.Router();

router
   .post("/create", protect, createProject)
   .post("/draft", protect, saveDraft)
   .get("/get-all-draft", protect, getDrafts)
   .get("/all", protect, restrict, getProjects)
   .get("/duration", getProjectByDuration)
   .get("/tech", getProjectByTech)
   .get("/name", getProjectByName)
   .get("/user", protect, getProjectByOwnUser)
   .get("/user/:id", protect, restrict, getProjectByUser)
   .get("/:id", getProjectById)
   .patch("/update/:id", protect, updateProject)
   .patch("/publish/:id", protect, publishDraft)
   .delete("/delete/:id", protect, deleteProject)
   .delete("/draft/delete/:id", protect, deleteDraft);

export default router;
