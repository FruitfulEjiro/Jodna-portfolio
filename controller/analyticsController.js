import CatchAsync from "express-async-handler";

// Local Modules
import Analytics from "../model/Analytics.js";
import Project from "../model/Project.js";
import AppError from "../utils/AppError.js";

// get most used tags
export const getMostUsedTech = CatchAsync(async (req, res, next) => {
   const { limit } = req.query;

   const result = await Analytics.aggregate([
      {
         $match: {
            analytics_type: "tech:created",
            tech: { $ne: null },
         },
      },
      {
         $group: {
            _id: "$tech",
            count: { $sum: 1 },
         },
      },
      {
         $sort: { count: -1 },
      },
      {
         $limit: Number(limit),
      },
   ]);

   if (!result) return next(new AppError("no results found", 404));

   res.status(200).json({
      status: "success",
      message: "data retrieved successfully",
      data: {
         result,
      },
   });
});

// Get most searched tech
export const getMostSearchedTech = CatchAsync(async (req, res, next) => {
   const { limit } = req.query;

   const tech = await Analytics.aggregate([
      {
         $match: {
            analytics_type: "tech:searched",
            tech: { $ne: null },
         },
      },
      {
         $group: {
            _id: "$tech",
            count: { $sum: 1 },
         },
      },
      {
         $sort: { count: -1 },
      },
      {
         $limit: Number(limit),
      },
   ]);

   if (!tech) return next(new AppError("no results found", 404));

   res.status(200).json({
      status: "success",
      message: "data retrieved successfully",
      data: {
         tech,
      },
   });
});

// Get projects created within specified time
export const getProjectCreatedIn = CatchAsync(async (req, res, next) => {
   const { startDate, endDate } = req.query;

   if (!startDate || !endDate) return next(new AppError("please provide start and end date", 400));

   const fromDate = new Date(startDate);
   const toDate = new Date(endDate);

   const projects = await Project.aggregate([
      {
         $match: {
            // analytics_type: "project:created",
            created_at: { $gte: fromDate, $lte: toDate },
         },
      },
      {
         $project: {
            _id: 0,
            projectId: "$_id",
            project_name: 1,
            project_image: 1,
            project_description: 1,
            project_duration: 1,
            tech: 1,
            total_views: 1,
            created_at: 1,
         },
      },
      {
         $sort: { created_at: -1 },
      },
   ]);

   if (!projects) return next(new AppError("no project found", 404));

   res.status(200).json({
      status: "success",
      message: projects.length > 0 ? "projects retrieved successfully" : "no projects found",
      results: projects.length,
      data: {
         projects,
      },
   });
});

//  Get most viewed project
export const getHighestViewedProject = CatchAsync(async (req, res, next) => {
   const { limit } = req.query;

   const projects = await Project.find().sort({ total_views: 1 }).limit(Number(limit));
   if (!projects) return next(new AppError("no projects found", 404));

   res.status(200).json({
      status: "success",
      message: projects.length > 0 ? "project(s) retrieved successfully" : "no projects found",
      results: projects.length,
      data: {
         projects,
      },
   });
});

// Get most viewed tech
export const getHighestViewedTech = CatchAsync(async (req, res, next) => {
   const { limit } = req.query;

   const projects = await Analytics.aggregate([
      {
         $match: {
            analytics_type: "tech:viewed",
            tech: { $ne: null },
         },
      },
      {
         $group: {
            _id: "$tech",
            count: { $sum: 1 },
         },
      },
      {
         $sort: { count: -1 },
      },
      {
         $limit: Number(limit),
      },
   ]);
   if (!projects) return next(new AppError("no projects found", 404));

   res.status(200).json({
      status: "success",
      message: projects.length > 0 ? "project(s) retrieved successfully" : "no projects found",
      results: projects.length,
      data: {
         projects,
      },
   });
});

// Get unique viewers per project
export const getUniqueViewers = CatchAsync(async (req, res, next) => {
   const { project_id } = req.params;

   const uniqueViewers = await Analytics.aggregate([
      {
         $match: {
            analytics_type: "unique:user",
            projectId: { $ne: null },
         },
      },
      {
         $group: {
            _id: "$projectId",
            count: { $sum: 1 },
         },
      },
      {
         $sort: { count: -1 },
      },
   ]);

   if (!uniqueViewers) return next(new AppError("no unique viewers found", 404));

   res.status(200).json({
      status: "success",
      message: uniqueViewers.length > 0 ? "data retrieved successfully" : "no data found",
      results: uniqueViewers.length,
      data: {
         uniqueViewers,
      },
   });
});
