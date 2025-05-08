import CatchAsync from "express-async-handler";

// Local Modules
import Analytics from "../model/Analytics.js";
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

   const tech = Analytics.aggregate([
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

   const projects = Analytics.aggregate([
      {
         $match: {
            analytics_type: "project:created",
            createdAt: { $gte: startDate, $lte: endDate },
         },
      },
      {
         $group: {
            _id: "$createdAt",
            count: { $sum: 1 },
         },
      },
      {
         $sort: { count: -1 },
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

//  Get total views per project
export const getTotalviews = CatchAsync(async (req, res, next) => {
   const { id } = req.body;

   const project = findOne({ total_views });
});

// get uniqueViewers