import { v2 as cloudinary } from "cloudinary";
import CatchAsync from "express-async-handler";
import dotenv from "dotenv";

// Local Modules
import AppError from "../utils/AppError.js";

dotenv.config();

// Configuration
cloudinary.config({
   cloud_name: process.env.CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
export const uploadImageCloudinary = CatchAsync(async (file) => {
   const uploadResult = await cloudinary.uploader.upload(file);

   if (!uploadResult) return next(new AppError("Problem Uploading Image!! Try again", 500));
   const { secure_url, public_id } = uploadResult;
   return { secure_url, public_id };
});

// Delete image from Cloudinary
export const deleteImageCloudinary = CatchAsync(async (publicId) => {
   const result = await cloudinary.uploader.destroy(publicId);
   if (!result) return next(new AppError("Problem Deleting Image!! Try again", 500));
   return result;
});
