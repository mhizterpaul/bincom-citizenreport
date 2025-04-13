import express from "express";
import AuthController from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = express.Router();

// Public routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
//router.post("/forgot-password", AuthController.requestPasswordReset);

// Protected routes
router.post("/logout", authenticateToken, AuthController.logout);
//router.put(
//  "/change-password",
//  authenticateToken,
//  AuthController.changePassword
//);

export default router;
