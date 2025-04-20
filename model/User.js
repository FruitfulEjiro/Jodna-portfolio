import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
   fullname: {
      firstname: {
         type: String,
         required: true,
      },
      lastname: {
         type: String,
         required: true,
      },
   },
   email: {
      type: String,
      required: true,
      unique: true,
   },
   password: {
      type: String,
      required: true,
   },
});
// mongoose middleware
UserSchema.pre("save", async function (next) {
   if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
   }
   next();
});

const User = mongoose.model("User", UserSchema);
export default User;
