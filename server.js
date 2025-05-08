import dotenv from "dotenv";

// Local Modules
import connectDB from "./model/DB.js";
import app from "./app.js";

// Events
import "./events/eventListener.js";

// set up env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});
