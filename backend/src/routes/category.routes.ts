import express from "express";
import { CategoryController } from "../controllers/category.controller";
import { authenticateToken as authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

// Public routes
router.get("/", CategoryController.getCategories);
router.get("/:id", CategoryController.getCategoryById);

// Protected routes (admin only)
router.post("/", authMiddleware, CategoryController.createCategory);
router.put("/:id", authMiddleware, CategoryController.updateCategory);
router.delete("/:id", authMiddleware, CategoryController.deleteCategory);

export default router;
