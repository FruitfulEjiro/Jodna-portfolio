import express from "express";
import CookieParser from "cookie-parser";
import cors from "cors";

// Local Modules
import ErrorHandler from "./utils/ErrorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import saveRoutes from "./routes/saveItemRoutes.js";

const app = express();

const allowedOrigins = [
   "https://portfolio-project-jffm.vercel.app/",
   "https://portfolio-project-sage-five.vercel.app",
   "https://portfolio-project-alpha-blush.vercel.app",
   "http://127.0.0.1:5500",
   "http://127.0.0.1:5501",
   "http://127.0.0.1:5502",
   "http://127.0.0.1:5504",
   "http://127.0.0.1:5505",
   "http://127.0.0.1:5173",
   "http://127.0.0.1:5174",
   "http://127.0.0.1:5174",
];

app.use(
   cors({
      origin: (origin, callback) => {
         if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
         } else {
            callback(new Error("Not allowed by CORS"));
         }
      },
      credentials: true,
   })
);
// app.use(cors());

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
