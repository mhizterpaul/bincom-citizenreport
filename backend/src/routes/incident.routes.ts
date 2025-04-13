import express from "express";
import { IncidentController } from "../controllers/incident.controller";
import { authenticateToken as authMiddleware } from "../middleware/auth.middleware";
import { validateRequest as validateIncident } from "../middleware/validate.middleware";
import { processImages } from "../middleware/image.middleware";
import multer from "multer";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Create incident with image upload
router.post(
  "/",
  authMiddleware,
  upload.array("images"),
  processImages,
  validateIncident,
  IncidentController.createIncident
);

// Update incident with image upload
router.put(
  "/:id",
  authMiddleware,
  upload.array("images"),
  processImages,
  validateIncident,
  IncidentController.updateIncident
);

// Get all incidents
router.get("/", IncidentController.getIncidents);

// Get user's incidents
router.get("/user", authMiddleware, IncidentController.getUserIncidents);

// Get incident by ID
router.get("/:id", IncidentController.getIncidentById);

// Delete incident
router.delete("/:id", authMiddleware, IncidentController.deleteIncident);

// Get incidents by category
router.get("/category/:categoryId", IncidentController.getIncidentsByCategory);

// Get incident statistics
router.get("/stats", IncidentController.getIncidentStats);

export default router;
