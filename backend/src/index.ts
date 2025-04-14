import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import incidentRoutes from "./routes/incident.routes";
import categoryRoutes from "./routes/category.routes";
import notificationRoutes from "./routes/notification.routes";
import userRoutes from "./routes/user.routes";
//import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const server = createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Your local development frontend
      "https://bincom-citizen-report.vercel.app", // Any other local development URLs
      "http://www.citizen-report.eu-4.evennode.com",
      "https://www.citizen-report.eu-4.evennode.com",
      /\.citizen-report\.eu-4\.evennode\.com$/, // Any subdomains of your production domain
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
    exposedHeaders: ["set-cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/incidents", incidentRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/users", userRoutes);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  }
);

const PORT = process.env.PORT || 3000;
// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() =>
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    })
  )
  .catch((err) => console.error("MongoDB connection error:", err));
