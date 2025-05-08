import eventEmitter from "./eventEmitter.js";
import CatchAsync from "express-async-handler";

// Local Modules
import Analytics from "../model/Analytics.js";

// Listen for when a project is created
eventEmitter.on(
   "project:created",
   CatchAsync(async ({ userId, projectId, techArray }) => {
      await Analytics.create({
         analytics_type: "project:created",
         userId,
         projectId,
         createdAt: new Date(),
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
                  createdAt: new Date(),
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
                  createdAt: new Date(),
               })
            )
         );
   })
);

// listen for unique viewers
eventEmitter.on(
   "unique:user",
   CatchAsync(async ({ userId }) => {
      await Analytics.create({
         analytics_type: "unique:user",
         userId,
         createdAt: new Date(),
      });
   })
);

// Listen for viewed project
eventEmitter.on(
   "project:viewed",
   CatchAsync(async ({ userId, projectId, techArray }) => {
      if (techArray.length > 0) {
         await Promise.all(
            techArray.map((tech) =>
               Analytics.create({
                  analytics_type: "project:viewed",
                  userId,
                  projectId,
                  tech,
                  createdAt: new Date(),
               })
            )
         );
      }
   })
);

console.log("Event listeners loaded ✅");
