import CatchAsync from "express-async-handler";

// Local Modules
import User from "../model/User.js";
import Admin from "..//model/Admin.js";
import Project from "../model/Project.js";
import SavedItems from "../model/SavedItems.js";
import AppError from "../utils/AppError.js";

export const saveItem = CatchAsync(async (req, res, next) => {
   const { id } = req.params;
   const user = req.user;

   // Check if user exists
   const checkUser = await User.findById(user._id);
   if (checkUser) {
      // Check if project exists
      const project = await Project.findById(id);
      if (!project) return next(new AppError("Project doesn't exist", 404));

      // Check if project is already saved by user
      const isSaved = await SavedItems.findOne({ user: user._id, project: id });
      if (isSaved) return next(new AppError("User already save this project", 400));

      // Save project
      const saveProject = await SavedItems.create({
         user: user._id,
         project: id,
      });
      if (!saveProject) return next(new AppError("Couldn't save project. Try again!!", 500));

      res.status(200).json({
         status: "success",
         message: "Project saved successfully",
         data: {
            saveProject,
         },
      });
   } else if (!checkUser) {
      const checkAdmin = await Admin.findById(user._id);
      if (!checkAdmin) return next(new AppError("User doesnt exist", 404));

      // Check if project exists
      const project = await Project.findById(id);
      if (!project) return next(new AppError("Project doesn't exist", 404));

      // Check if project is already saved by user
      const isSaved = await SavedItems.findOne({ user: user._id, project: id });
      if (isSaved) return next(new AppError("User already save this project", 400));

      // Save project
      const saveProject = await SavedItems.create({
         user: user._id,
         project: id,
      });
      if (!saveProject) return next(new AppError("Couldn't save project. Try again!!", 500));

      res.status(200).json({
         status: "success",
         message: "Project saved successfully",
         data: {
            saveProject,
         },
      });
   } else {
      return next(new AppError("User doesn't exist", 404));
   }

   // Check if project exists
   const project = await Project.findById(id);
   if (!project) return next(new AppError("Project doesn't exist", 404));

   // Check if project is already saved by user
   const isSaved = await SavedItems.findOne({ user: user._id, project: id });
   if (isSaved) return next(new AppError("User already save this project", 400));

   // Save project
   const saveProject = await SavedItems.create({
      user: user._id,
      project: id,
   });
   if (!saveProject) return next(new AppError("Couldn't save project. Try again!!", 500));

   res.status(200).json({
      status: "success",
      message: "Project saved successfully",
      data: {
         saveProject,
      },
   });
});

// get all saved items
export const getSavedItems = CatchAsync(async (req, res, next) => {
   const user = req.user;

   // Check if user exists
   const checkUser = await User.findById(user._id);
   if (checkUser) {
      // Get saved items
      const savedItems = await SavedItems.find({ user: user._id }).populate("project");
      if (!savedItems) return next(new AppError("No saved items found", 404));

      res.status(200).json({
         status: "success",
         message: savedItems.length > 0 ? "Saved items retrieved successfully" : "No items found",
         data: {
            savedItems,
         },
      });
   } else if (!checkUser) {
      const checkAdmin = await Admin.findById(user._id);
      if (!checkAdmin) return next(new AppError("User doesn't exist", 404));

      // Get saved items
      const savedItems = await SavedItems.find({ user: user._id }).populate("project");
      if (!savedItems) return next(new AppError("No saved items found", 404));

      res.status(200).json({
         status: "success",
         message: savedItems.length > 0 ? "Saved items retrieved successfully" : "No items found",
         data: {
            savedItems,
         },
      });
   } else {
      return next(new AppError("User doesn't exist", 404));
   }

   // Get saved items
   const savedItems = await SavedItems.find({ user: user._id }).populate("project");
   if (!savedItems) return next(new AppError("No saved items found", 404));

   res.status(200).json({
      status: "success",
      message: savedItems.length > 0 ? "Saved items retrieved successfully" : "No items found",
      data: {
         savedItems,
      },
   });
});

// unsave item
export const unsaveItem = CatchAsync(async (req, res, next) => {
   const { id } = req.params;
   const user = req.user;

   // Check if user exists
   const checkUser = await User.findById(user._id);
   if (checkUser) {
      // Check if project exists
      const project = await Project.findById(id);
      if (!project) return next(new AppError("Project doesn't exist", 404));

      // Check if project was saved by same user
      const isSaved = await SavedItems.findOne({ user: user._id, project: id });
      if (!isSaved) return next(new AppError("User haven't saved this project", 400));

      // unsave project
      const unsaveProject = await SavedItems.findOneAndDelete({ user: user._id, project: id });
      if (!unsaveProject) return next(new AppError("Couldn't remove project from saved items. Try again!!", 500));

      res.status(204).json({
         status: "success",
         message: "Project unsaved successfully",
      });
   } else if (!checkUser) {
      const checkAdmin = await Admin.findById(user._id);
      if (!checkAdmin) return next(new AppError("User doesn't exist", 404));

      // Check if project exists
      const project = await Project.findById(id);
      if (!project) return next(new AppError("Project doesn't exist", 404));

      // Check if project was saved by same user
      const isSaved = await SavedItems.findOne({ user: user._id, project: id });
      if (!isSaved) return next(new AppError("User haven't saved this project", 400));

      // unsave project
      const unsaveProject = await SavedItems.findOneAndDelete({ user: user._id, project: id });
      if (!unsaveProject) return next(new AppError("Couldn't remove project from saved items. Try again!!", 500));

      res.status(204).json({
         status: "success",
         message: "Project unsaved successfully",
      });
   } else {
      return next(new AppError("User doesn't exist", 404));
   }
});
