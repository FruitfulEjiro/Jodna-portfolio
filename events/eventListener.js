import eventEmitter from "./eventEmitter.js";
import CatchAsync from "express-async-handler";

// Local Modules
import Analytics from "../model/Analytics.js";
import Project from "../model/Project.js";

// Listen for when a project is created
eventEmitter.on(
   "project:created",
   CatchAsync(async ({ userId, projectId, techArray }) => {
      await Analytics.create({
         analytics_type: "project:created",
         userId,
         projectId,
         created_at: new Date(),
      });

      // save tags used
      if (techArray.length > 0) {
         await Promise.all(
            techArray.map((tech) =>
               Analytics.create({
                  analytics_type: "tech:created",
                  userId,
                  projectId,
                  tech,
                  created_at: new Date(),
               })
            )
         );
      }
   })
);

// Listen for tech searched
eventEmitter.on(
   "tech:searched",
   CatchAsync(async ({ userId, projectId, techArray }) => {
      if (techArray.length > 0)
         await Promise.all(
            techArray.map((tech) =>
               Analytics.create({
                  analytics_type: "tech:searched",
                  userId,
                  projectId,
                  tech,
                  created_at: new Date(),
               })
            )
         );
   })
);

// listen for unique viewers
eventEmitter.on(
   "unique:user",
   CatchAsync(async ({ projectId, userId }) => {
      if (userId == 0) return;
      if (await Analytics.findOne(userId)) return;
      await Analytics.create({
         analytics_type: "unique:user",
         projectId,
         userId,
         created_at: new Date(),
      });
   })
);

// Listen for viewed project
eventEmitter.on(
   "project:viewed",
   CatchAsync(async ({ userId, projectId, techArray }) => {
      // log project viewed
      await Project.findByIdAndUpdate(projectId, { $inc: { total_views: 1 } });

      // log tech viewed
      if (techArray.length > 0)
         await Promise.all(
            techArray.map((tech) =>
               Analytics.create({
                  analytics_type: "tech:viewed",
                  userId,
                  projectId,
                  tech,
                  created_at: new Date(),
               })
            )
         );
   })
);