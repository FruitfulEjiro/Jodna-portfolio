import CatchAsync from "express-async-handler";

// Local Modules
import User from "../model/User.js";
import createSendToken from "../middleware/jwt.js";
import AppError from "../utils/AppError.js";

// Signup User
export const signup = CatchAsync(async (req, res) => {
   const { firstname, lastname, email, password } = req.body;

   const user = await User.create({
      fullname: {
         firstname,
         lastname,
      },
      email,
      password,
   });

   if (!user) return next(new AppError("Error creating account!! Try again", 500));

   createSendToken(user, 201, res);
});
