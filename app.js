import express from "express";
import CookieParser from "cookie-parser";

// Local Modules
import ErrorHandler from "./utils/ErrorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import saveRoutes from "./routes/saveItemRoutes.js";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(CookieParser());

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/project", projectRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/item", saveRoutes);

app.use(ErrorHandler);

export default app;
