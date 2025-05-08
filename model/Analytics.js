import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
   analytics_type: {
      type: String,
   }, // e.g., project:created
   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
   },
   projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
   },
   tech: {
      type: String,
      required: false,
      lowercase: true,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

const Analytics = mongoose.model("Analytic", analyticsSchema);

export default Analytics;
