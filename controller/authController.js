import CatchAsync from "express-async-handler";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Local Modules
import User from "../model/User.js";
import Admin from "../model/Admin.js";
import createSendToken from "../middleware/jwt.js";
import AppError from "../utils/AppError.js";
import sendEmail from "../middleware/Email.js";

// Signup Admin
export const createAdmin = CatchAsync(async (req, res, next) => {
   const { firstname, lastname, email, password } = req.body;

   const lowerEmail = email.toLowerCase();
   const duplicate = User.findOne({ lowerEmail });
   if (!duplicate) return next(new AppError("A user with this email already Exists", 400));

   const admin = await Admin.create({
      fullname: {
         firstname,
         lastname,
      },
      email: lowerEmail,
      password,
      gender: "rather not say",
   });

   if (!admin) return next(new AppError("Error creating account!! Try again", 500));

   const adminObj = admin.toObject();
   delete adminObj.password;

   createSendToken(adminObj, 201, res);
});

// Login Admin
export const loginAdmin = CatchAsync(async (req, res, next) => {
   const { email, password } = req.body;

   // Check if email and password exist
   if (!email || !password) return next(new AppError("Please Provide Email and Password", 400));

   const lowerEmail = email.toLowerCase();
   // Find User by email
   const admin = await Admin.findOne({ lowerEmail }).select("+password");

   if (!admin || !(await admin.comparePassword(password)))
      return next(new AppError("Incorrect Email or Password", 401));

   const adminObj = admin.toObject();

   delete adminObj.password;

   // Generate JWT token and send via Cookie
   createSendToken(adminObj, 200, res);
});

// Signup User
export const signup = CatchAsync(async (req, res) => {
   const { firstname, lastname, email, password } = req.body;

   const lowerEmail = email.toLowerCase();
   const duplicate = Admin.findOne({ lowerEmail });
   if (!duplicate) return next(new AppError("A user with this email already Exists", 400));

   const user = await User.create({
      fullname: {
         firstname,
         lastname,
      },
      email: lowerEmail,
      password,
      gender: "rather not say",
   });

   if (!user) return next(new AppError("Error creating account!! Try again", 500));

   const userObj = user.toObject();
   delete userObj.password;

   createSendToken(userObj, 201, res);
});

// Login User
export const login = CatchAsync(async (req, res, next) => {
   const { email, password } = req.body;

   // Check if email and password exist
   if (!email || !password) return next(new AppError("Please Provide Email and Password", 400));

   const lowerEmail = email.toLowerCase();
   // Find User by email
   const user = await User.findOne({ lowerEmail }).select("+password");

   if (!user || !(await user.comparePassword(password))) return next(new AppError("Incorrect Email or Password", 401));

   const userObj = user.toObject();

   delete userObj.password;

   // Generate JWT token and send via Cookie
   createSendToken(userObj, 200, res);
});

// Forget password
export const forgotPassword = CatchAsync(async (req, res, next) => {
   const { email } = req.body;

   const lowerEmail = email.toLowerCase();
   // Get user from Database
   let user;
   (await User.findOne({ lowerEmail }))
      ? (user = await User.findOne({ lowerEmail }))
      : (user = await Admin.findOne({ lowerEmail }));
   if (!user) return next(new AppError("No User with this Email was found", 404));
   // Generate random reset token
   const resetToken = await user.createPasswordResetToken();
   await user.save({ validatebeforeSave: false });

   // Send Mail to user
   const resetURL = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;

   const message = `Hi ${user.fullname.firstname}, We received a request to reset the password for your account. To reset your password, Click on this link: ${resetURL} to reset your password. Pls ignore this email if you didn't request to reset your password. This code will expire in 10 minutes for your security. If you have any questions or need help, feel free to contact our support team. Best regards,  
   
   The code is valid for 10 mins only

   The Jodna Team`;

   const html = `<div style="font-family: Arial, sans-serif; line-height: 1.5;">
    <h2>Password Reset Request</h2>
    <p>Hi <strong>${user.fullname.firstname}</strong>,</p>
    <p>We received a request to reset your password.</p>
    <br />
    <a href="${resetURL}" style="background: #f0f0f0; padding: 10px; display: inline-block;">CLick here to reset your password</a>
    <p>This code will expire in <strong>10 minutes</strong>.</p>
    <p>If you did not request this, you can safely ignore this email.</p>
    <br />
    <p>Best regards,</p>
    <p><strong>The Jodna Team</strong></p>
  </div>`;

   try {
      await sendEmail(lowerEmail, "Your Password Reset Token (Valid for 10 mins)", message, html);

      res.status(200).json({
         status: "success",
         message: "Token sent to your mail",
      });
   } catch (Err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError("An error occured, try sending mail again", 500));
   }
});

// Reset password
export const resetPassword = CatchAsync(async (req, res, next) => {
   // Get user based on the reset token
   const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
   let user;

   (await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
   }))
      ? (user = await User.findOne({
           passwordResetToken: hashedToken,
           passwordResetExpires: { $gt: Date.now() },
        }))
      : (user = await Admin.findOne({
           passwordResetToken: hashedToken,
           passwordResetExpires: { $gt: Date.now() },
        }));

   // If user is found and token has not expires, set new password
   if (!user) return next(new AppError("Token is invalid or expired", 401));

   user.password = req.body.password;
   user.passwordResetToken = undefined;
   user.passwordResetExpires = undefined;
   await user.save();

   // Update passwordChangedAt for user
   // Handled using a Mongoose middleware

   const userObj = user.toObject();

   delete userObj.password;

   // Log in user
   createSendToken(userObj, 200, res);
});

// Update password
export const updatePassword = CatchAsync(async (req, res, next) => {
   const { password, newPassword } = req.body;

   // Get user from database
   const user = await User.findById(req.user._id).select("+password");
   if (!user) return next(new AppError("User not found, Login to change your password", 404));

   // Check if password is correct
   if (!(await user.comparePassword(password))) return next(new AppError("Incorrect Password", 401));

   // Update password
   user.password = newPassword;
   const saveUser = await user.save({ validateBeforeSave: true });
   if (!saveUser) return next(new AppError("Could not update password", 500));

   // Log in user
   const userObj = user.toObject();

   delete userObj.password;

   createSendToken(userObj, 200, res);
});

// Update admin password
export const updateAdminPassword = CatchAsync(async (req, res, next) => {
   const { password, newPassword } = req.body;

   // Get user from database
   const admin = await Admin.findById(req.user._id).select("+password");
   if (!admin) return next(new AppError("Admin not found, Login to change your password", 404));

   // Check if password is correct
   if (!(await admin.comparePassword(password))) return next(new AppError("Incorrect Password", 401));

   // Update password
   admin.password = newPassword;
   const saveAdmin = await admin.save({ validateBeforeSave: true });
   if (!saveAdmin) return next(new AppError("Could not update password", 500));

   // Log in user
   const adminObj = admin.toObject();

   delete adminObj.password;

   createSendToken(adminObj, 200, res);
});

// Protect middleware
export const protect = CatchAsync(async (req, res, next) => {
   // Retrieve the token from cookie
   let token = req.cookies.jwt;

   if (!token) return next(new AppError("You are not Logged in", 401));

   // Verify JWT
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   if (!decoded) return next(new AppError("You are not Logged in", 401));

   // Find User by id from decoded token
   const user = await User.findById(decoded.id);
   if (user) {
      // Check if user changed password after token was issued
      if (user.changedPasswordAt(decoded.iat)) return next(new AppError("User changed password, Login again", 401));

      // Grant user access to the Protected Routes
      req.user = user;
      return next();
   } else if (!user) {
      const admin = await Admin.findById(decoded.id);
      if (!admin) return next(new AppError("The User belonging to this token no longer exists", 401));

      // Check if user changed password after token was issued
      if (admin.changedPasswordAt(decoded.iat)) return next(new AppError("User changed password, Login again", 401));

      // Grant user access to the Protected Routes
      req.user = admin;
      return next();
   } else {
      return next(new AppError("The User belonging to this token no longer exists", 401));
   }
});

// Authorization middleware
export const restrict = CatchAsync(async (req, res, next) => {
   // Check if user is admin
   if (req.user.role !== "admin") return next(new AppError("You do not have permission to perform this action", 403));
   next();
});

// Logout
export const logout = CatchAsync(async (req, res, next) => {
   // Clear cookie
   return res
      .status(200)
      .cookie("jwt", "loggedout", {
         expires: new Date(Date.now() + 5 * 1000),
         httpOnly: true,
      })
      .json({
         status: "success",
         message: "Logged out successfully",
      });
});
