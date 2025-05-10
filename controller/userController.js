import CatchAsync from "express-async-handler";

// Local Modules
import User from "../model/User.js";
import Admin from "../model/Admin.js";
import { uploadImageCloudinary, deleteImageCloudinary } from "../middleware/cloudinary.js";
import AppError from "../utils/AppError.js";

export const updateAdmin = CatchAsync(async (req, res, next) => {
   const { firstname, lastname, phone, avatar } = req.body;
   const admin = req.user;

   // Check if user exists
   const updateAdmin = await Admin.findById(admin._id);
   if (!updateAdmin) return next(new AppError("Admin not found", 404));

   // upload avatar to cloudinary
   let imageObj = {};
   if (avatar) {
      if (updateUser.avatar) {
         // delete old avatar from cloudinary
         const deleteImage = await deleteImageCloudinary(updateUser.avatar.public_id);
         if (!deleteImage) return next(new AppError("Couldnt delete Image!! Try again", 500));
      }
      // upload new avatar to cloudinary
      const result = await uploadImageCloudinary(avatar);
      if (!result) return next(new AppError("Couldnt upload Image!! Try again", 500));
      imageObj.image_url = result.secure_url;
      imageObj.public_id = result.public_id;
   }

   // Update user details
   updateAdmin.fullname.firstname = firstname || updateAdmin.fullname.firstname;
   updateAdmin.fullname.lastname = lastname || updateAdmin.fullname.lastname;
   updateAdmin.email = email || updateAdmin.email;
   updateAdmin.phone = phone || updateAdmin.phone;
   updateAdmin.avatar = imageObj || updateAdmin.avatar;

   await admin.save({ validateBeforeSave: true });

   res.status(200).json({
      status: "success",
      message: "Admin updated successfully",
      data: {
         admin,
      },
   });
});

export const updateUser = CatchAsync(async (req, res, next) => {
   const { firstname, lastname, phone, avatar } = req.body;
   const user = req.user;

   // Check if user exists
   const updateUser = await User.findById(user._id);
   if (!updateUser) return next(new AppError("User not found", 404));

   // upload avatar to cloudinary
   let imageObj = {};
   if (avatar) {
      if (updateUser.avatar) {
         // delete old avatar from cloudinary
         const deleteImage = await deleteImageCloudinary(updateUser.avatar.public_id);
         if (!deleteImage) return next(new AppError("Couldnt delete Image!! Try again", 500));
      }
      // upload new avatar to cloudinary
      const result = await uploadImageCloudinary(avatar);
      if (!result) return next(new AppError("Couldnt upload Image!! Try again", 500));
      imageObj.image_url = result.secure_url;
      imageObj.public_id = result.public_id;
   }

   // Update user details
   updateUser.fullname.firstname = firstname || updateUser.fullname.firstname;
   updateUser.fullname.lastname = lastname || updateUser.fullname.lastname;
   updateUser.email = email || updateUser.email;
   updateUser.phone = phone || updateUser.phone;
   updateUser.avatar = imageObj || updateUser.avatar;

   await user.save({ validateBeforeSave: true });

   res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: {
         user,
      },
   });
});

export const deleteAdmin = CatchAsync(async (req, res, next) => {
   const { id } = req.params;

   const admin = await Admin.findById(id);
   if (!admin) return next(new AppError("Admin doesn't exist", 404));
   if (admin.avatar) {
      // delete avatar from cloudinary
      const deleteImage = await deleteImageCloudinary(admin.avatar.public_id);
      if (!deleteImage) return next(new AppError("Couldnt delete Image!! Try again", 500));
   }

   const deleteAdmin = await User.findByIdAndDelete(id);
   if (!deleteAdmin) return next(new AppError("Couldn't delete admin. Try again!!", 500));

   res.status(204).json({
      status: "success",
      message: "Admin deleted successfuly",
   });
});

export const deleteUserByAdmin = CatchAsync(async (req, res, next) => {
   const { id } = req.params;

   const user = await User.findById(id);
   if (!user) return next(new AppError("User doesn't exist", 404));
   if (user.avatar) {
      // delete avatar from cloudinary
      const deleteImage = await deleteImageCloudinary(updateUser.avatar.public_id);
      if (!deleteImage) return next(new AppError("Couldnt delete Image!! Try again", 500));
   }

   const deleteUser = await User.findByIdAndDelete(id);
   if (!deleteUser) return next(new AppError("Couldn't delete user. Try again!!", 500));

   res.status(204).json({
      status: "success",
      message: "user deleted successfuly",
   });
});

export const deleteUser = CatchAsync(async (req, res, next) => {
   const user = req.user;

   const checkUser = await User.findById(user._id);
   if (!checkUser) return next(new AppError("User doesn't exist", 404));
   if (checkUser.avatar) {
      // delete avatar from cloudinary
      const deleteImage = await deleteImageCloudinary(checkUser.avatar.public_id);
      if (!deleteImage) return next(new AppError("Couldnt delete Image!! Try again", 500));
   }

   const deleteUser = await User.findByIdAndDelete(user._id);
   if (!deleteUser) return next(new AppError("Couldn't delete user. Try again!!", 500));

   res.status(204).json({
      status: "success",
      message: "user deleted successfuly",
   });
});