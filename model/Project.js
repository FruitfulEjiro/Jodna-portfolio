import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
   user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
   },
   project_name: {
      type: String,
      required: true,
   },
   project_image: {
      public_id: {
         type: String,
         required: true,
      },
      image_url: {
         type: String,
         required: true,
      },
   },
   project_duration: {
      type: String,
      required: false,
   },
   total_views: {
      type: Number,
      required: false,
   },
   tech: [
      {
         type: String,
         required: true,
         lowercase: true,
      },
   ],
   project_description: {
      type: String,
      required: false,
   },
   status: {
      type: String,
      required: true,
      enum: ["draft", "published"],
      default: "published",
      select: false,
   },
   created_at: {
      type: Date,
      default: Date.now,
   },
});

ProjectSchema.index({ project_name: "text", project_description: "text", tech: "text" });

const Project = new mongoose.model("Project", ProjectSchema);

export default Project;
