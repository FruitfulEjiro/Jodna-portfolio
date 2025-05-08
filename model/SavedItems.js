import mongoose from "mongoose";

const SavedItemsSchema = new mongoose.Schema({
   user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
   },
   project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
   },
   date_saved: {
      type: Date,
      default: Date.now,
   },
});

const SavedItems = mongoose.model("SavedItems", SavedItemsSchema);

export default SavedItems;
