import express from "express";
import CookieParser from "cookie-parser";

// Local Modules
import ErrorHandler from "./utils/ErrorHandler.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(CookieParser());

// Routes
app.use("/auth", authRoutes)

app.use(ErrorHandler);

export default app;