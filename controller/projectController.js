import CatchAsync from "express-async-handler";

// Local Modules
import Project from "../model/Project.js";
import { uploadImageCloudinary, deleteImageCloudinary } from "../middleware/cloudinary.js";
import AppError from "../utils/AppError.js";
import Event from "../events/eventEmitter.js";

export const createProject = CatchAsync(async (req, res, next) => {
   const { project_name, period, count, project_image, tech, project_url, project_description } = req.body;
   const user = req.user;

   let imageObj = {};
   if (project_image) {
      const result = await uploadImageCloudinary(project_image);
      if (!result) return next(new AppError("Couldnt upload Image!! Try again", 500));
      imageObj.image_url = result.secure_url;
      imageObj.public_id = result.public_id;
   }

   const project = await Project.create({
      user: user._id,
      project_name,
      project_image: imageObj,
      project_duration: {
         period,
         count: Number(count),
      },
      tech,
      project_url: project_url ? project_url : "",
      project_description,
   });

   // if error, delete image from cloudinary
   if (!project) {
      await deleteImageCloudinary(imageObj.public_id);
      return next(new AppError("Project not created, Try again!!", 500));
   }

   // Event.emit("project:created", {
   //    projectId: project._id,
   //    userId: user._id,
   //    techArray: project.tech,
   // });

   res.status(201).json({
      status: "success",
      message: "Project created successfully",
      data: {
         project,
      },
   });
});

export const saveDraft = CatchAsync(async (req, res, next) => {
   const { project_name, count, period, project_image, tech, project_url, project_description } = req.body;
   const user = req.user;

   let imageObj = {};
   if (project_image) {
      const result = await uploadImageCloudinary(project_image);
      if (!result) return next(new AppError("Couldnt upload Image!! Try again", 500));
      imageObj.image_url = result.secure_url;
      imageObj.public_id = result.public_id;
   }

   const project = new Project({
      user: user._id,
      project_name,
      project_image: imageObj,
      project_duration: {
         count: Number(count),
         period,
      },
      tech,
      project_url: project_url ? project_url : "",
      project_description,
      status: "draft",
   });

   await project.save({ validateBeforeSave: false });

   // if error, delete image from cloudinary
   if (!project) {
      await deleteImageCloudinary(imageObj.public_id);
      return next(new AppError("Project not created, Try again!!", 500));
   }

   res.status(201).json({
      status: "success",
      message: "Draft saved successfully",
      data: {
         project,
      },
   });
});

export const publishDraft = CatchAsync(async (req, res, next) => {
   const { project_name, count, period, project_image, tech, project_url, project_description } = req.body;
   const user = req.user;
   const { id } = req.params;

   // find draft
   const draftProject = await Project.findOne({ _id: id, user: user._id });
   if (!draftProject) return next(new AppError("Project not saved as draft", 404));

   if (project_image) {
      // delete old image from cloudinary
      if (draftProject.project_image.public_id) {
         const deletedImage = await deleteImageCloudinary(draftProject.project_image.public_id);
         if (!deletedImage) return next(new AppError("Couldnt delete Image!! Try again", 500));
      }
      // upload new image to coudinary
      const result = await uploadImageCloudinary(project_image);
      if (!result) return next(new AppError("Couldnt upload Image!! Try again", 500));
      imageObj.image_url = result.secure_url;
      imageObj.public_id = result.public_id;
   }

   // convert tech to array if not an array
   let techArrr = Array.isArray(tech) ? tech : [tech];

   let techArr = [];
   tech ? (techArr = [...draftProject.tech, ...techArrr]) : (techArr = [...draftProject.tech]);

   // Update project
   const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
         $set: {
            project_name: project_name,
            project_image,
            project_duration: { period, count },
            tech: techArr,
            project_url,
            project_description,
            status: "published",
         },
      },
      { new: true, runValidators: true }
   );

   Event.emit("project:created", {
      projectId: updatedProject._id,
      userId: updatedProject.user,
      techArray: updatedProject.tech,
   });

   // if error, delete image from cloudinary
   if (!draftProject) {
      await deleteImageCloudinary(imageObj.public_id);
      return next(new AppError("Project not created, Try again!!", 500));
   }

   res.status(201).json({
      status: "success",
      message: "Draft saved successfully",
      data: {
         updatedProject,
      },
   });
});

export const deleteDraft = CatchAsync(async (req, rex, next) => {
   const { id } = req.params;
   const user = req.user;

   const deleteDraft = Project.findById(id);
   if (!deleteDraft) return next(new AppError("Project not found in draft", 404));

   if (deleteDraft.user != user._id) return next(new AppError("user can only delete personal draft", 400));
   if (deleteDraft.status != "draft") return next(new AppError("cant delete, draft is already published", 400));

   if (deleteDraft.project_image.public_id) {
      const deleteImage = await deleteImageCloudinary(imageObj.public_id);
      if (!deleteImage) return next(new AppError("Couldnt delete Image. Try again!!!", 500));
   }

   const deletedDraft = await Project.findByIdAndDelete(id);
   if (!deletedDraft) return next(new AppError("Draft not deleted. Try again!!!", 500));

   res.status(204).json({
      status: success,
      maessage: "draft deleted successfully",
   });
});

export const getDrafts = CatchAsync(async (req, res, next) => {
   const user = req.user;

   const drafts = await Project.find({ user: user._id, status: "draft" }).sort({ created_at: 1 });
   if (!drafts) return next(new AppError("No drafts found", 404));

   res.status(200).json({
      status: "success",
      message: drafts.length == 0 ? "No drafts found" : "Drafts retrieved successfully",
      results: drafts.length,
      data: {
         drafts,
      },
   });
});

export const updateProject = CatchAsync(async (req, res, next) => {
   const { project_name, project_image, count, period, tech, project_url, project_description } = req.body;
   const { id } = req.params;

   const project = await Project.findById(id);
   if (!project) return next(new AppError("Project not found", 404));

   // upload image to cloudinary
   let imageObj = {};
   if (project_image) {
      // delete old image from cloudinary
      const deletedImage = await deleteImageCloudinary(project.project_image.public_id);
      if (!deletedImage) return next(new AppError("Couldnt delete Image!! Try again", 500));
      // upload new image to coudinary
      const result = await uploadImageCloudinary(project_image);
      if (!result) return next(new AppError("Couldnt upload Image!! Try again", 500));
      imageObj.image_url = result.secure_url;
      imageObj.public_id = result.public_id;
   }

   // Update project
   if (project_name) project.project_name = project_name;
   if (project_image) project.project_image = imageObj;
   if (period) project.project_duration.period = period;
   if (count) project.project_duration.count = count;
   if (tech) project.tech = tech;
   if (project_url) project.project_url = project_url;
   if (project_description) project.project_description = project_description;

   // Save project
   const updatedProject = await project.save({ validateBeforeSave: true });

   // if error, delete image from cloudinary
   if (!updatedProject) {
      await deleteImageCloudinary(imageObj.public_id);
      return next(new AppError("Update project not saved! Try again.", 500));
   }

   res.status(200).json({
      status: "success",
      message: "project updated successfully",
      date: {
         project,
      },
   });
});

export const getProjects = CatchAsync(async (req, res, next) => {
   const projects = await Project.find({ status: "published" });
   if (!projects) return next(new AppError("No projects found", 404));

   res.status(200).json({
      status: "success",
      message: projects.length == 0 ? "No Projects found" : "Projects retrieved successully",
      results: projects.length,
      data: {
         projects,
      },
   });
});

export const getProjectById = CatchAsync(async (req, res, next) => {
   const { id } = req.params;

   const project = await Project.findById(id);
   if (!project) return next(new AppError("No project found", 404));

   // emit project:viewed event
   Event.emit("project:viewed", {
      projectId: project._id,
      techArray: project.tech,
   });

   Event.emit("unique:user", {
      projectId: project._id,
      userId: req.user ? req.user._id : 0,
   });

   res.status(200).json({
      status: "success",
      message: project.length == 0 ? "No project found" : "project retrieved successfully",
      data: {
         project,
      },
   });
});

export const getProjectByOwnUser = CatchAsync(async (req, res, next) => {
   const user = req.user;

   const project = await Project.find({ user: user._id }).populate("user", "fullname");
   if (!project) return next(new AppError("No project found", 404));

   res.status(200).json({
      status: "success",
      message: project.length == 0 ? "No project found" : "project retrieved successfully",
      result: project.length,
      data: {
         project,
      },
   });
});

export const getProjectByUser = CatchAsync(async (req, res, next) => {
   const { id } = req.params;

   const project = await Project.find({ user: id }).populate("user", "fullname");
   if (!project) return next(new AppError("No project found", 404));

   res.status(200).json({
      status: "success",
      message: project.length == 0 ? "No project found" : "project retrieved successfully",
      result: project.length,
      data: {
         project,
      },
   });
});

export const getProjectByTech = CatchAsync(async (req, res, next) => {
   const { techs } = req.query;

   const techArray = Array.isArray(techs) ? techs : [techs];

   const project = await Project.find({ tech: { $in: techArray } }).populate("user", "fullname");
   if (!project) return next(new AppError("No project found", 404));

   // Sort by relevance score descending
   const projects = project.map((proj) => {
      const matchCount = proj.tech.filter((t) => techArray.some((q) => t.toLowerCase() === q.toLowerCase())).length;

      return { ...proj.toObject(), relevanceScore: matchCount };
   });
   projects.sort((a, b) => b.relevanceScore - a.relevanceScore);

   Event.emit("tech:searched", {
      projectId: project._id,
      userId: req.user ? req.user._id : null,
      techArray,
   });

   res.status(200).json({
      status: "success",
      message: projects.length == 0 ? "No project found" : "project retrieved successfully",
      result: projects.length,
      data: {
         projects,
      },
   });
});

export const getProjectByName = CatchAsync(async (req, res, next) => {
   const { project_name } = req.query;

   const project = await Project.find(
      {
         $text: { $search: project_name },
      },
      { score: { $meta: "textScore" } }
   ).sort({ score: { $meta: "textScore" } });

   if (!project) return next(new AppError("project not found", 404));

   res.status(200).json({
      status: "success",
      message: project.length == 0 ? "No project found" : "project retrieved successfully",
      result: project.length,
      data: {
         project,
      },
   });
});

export const deleteProject = CatchAsync(async (req, res, next) => {
   const { id } = req.params;

   const project = await Project.findById(id);
   if (!project) return next(new AppError("Project not deleted. Try again!!!", 500));

   // delete image from cloudinary
   const { public_id } = project.project_image;
   if (public_id) {
      const deleteImage = await deleteImageCloudinary(public_id);
      if (!deleteImage) return next(new AppError("Couldnt delete Image. Try again!!!", 500));
   }
   // delete project
   const deletedProject = await Project.findByIdAndDelete(id);
   if (!deletedProject) return next(new AppError("Project not deleted. Try again!!!", 500));

   res.status(204).json({
      status: "success",
      message: "Project deleted successfully",
   });
});
