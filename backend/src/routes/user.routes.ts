import express from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import { body } from "express-validator";
import multer from "multer";
import UserController from "../controllers/user.controller";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Get user profile
router.get("/profile", authenticateToken, UserController.getUserInfo);

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  [
    body("firstName")
      .trim()
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("lastName")
      .trim()
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),
  ],
  validateRequest,
  UserController.updateProfile
);

// Add profile image
router.post(
  "/profile/image",
  authenticateToken,
  upload.single("image"),
  UserController.addProfileImage
);

// Remove profile image
router.delete(
  "/profile/image",
  authenticateToken,
  UserController.removeProfileImage
);

export default router;
