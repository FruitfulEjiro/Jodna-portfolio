import jwt from "jsonwebtoken";

const generateToken = (userID) => {
   const token = jwt.sign({ id: userID }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
   });
   return token;
};

const createSendToken = (user, code, res) => {
   const token = generateToken(user._id);
   const isProduction = process.env.NODE_ENV === "production";

   const cookieOptions = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: isProduction, 
      sameSite: isProduction ? "none" : "lax",
   };

   if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

   res.cookie("jwt", token, cookieOptions).json({
      status: "Success",
      message: "successful",
      data: {
         user,
      },
   });
   user.password = undefined;
};

export default createSendToken;
