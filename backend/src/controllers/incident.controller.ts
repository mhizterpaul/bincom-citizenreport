import { Request, Response } from "express";
import { Incident, IIncident } from "../models/incident.model";
import { Notification } from "../models/notification.model";
import { validationResult } from "express-validator";
import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model";
import { Category } from "../models/category.model";
import { Dropbox } from "dropbox";
import { v4 as uuidv4 } from "uuid";

// Initialize Dropbox client
const dropbox = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  clientId: process.env.DROPBOX_CLIENT_ID,
  clientSecret: process.env.DROPBOX_CLIENT_SECRET,
});

export class IncidentController {
  static async createIncident(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, category, location: locationStr } = req.body;
      const userId = req.user?.id;

      // Parse location if it's a string
      let location;
      try {
        location =
          typeof locationStr === "string"
            ? JSON.parse(locationStr)
            : locationStr;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid location format",
        });
      }

      // Get images from the processed files
      const images = req.body.images || [];

      const incident = new Incident({
        title,
        description,
        category,
        location,
        images,
        userId,
      });

      await incident.save();

      // Create notification for all users
      const users = await User.find();

      const notifications = users.map((user) => ({
        userId: user._id,
        type: "new_incident",
        message: `New incident reported: ${title}`,
        incidentId: incident._id,
      }));

      await Notification.insertMany(notifications);

      res.status(201).json({
        success: true,
        data: incident,
      });
    } catch (error: any) {
      console.error("Error creating incident:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getIncidents(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // Ensure page and limit are positive numbers
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.max(1, Number(limit));
      const skip = (pageNum - 1) * limitNum;

      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder === "desc" ? -1 : 1;

      const incidents = await Incident.find()
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate({
          path: "userId",
          select: "firstName lastName email image organization",
        })
        .populate({
          path: "category",
          select: "name",
        })
        .populate({
          path: "assignedTo",
          select: "firstName lastName email image organization",
        })
        .lean(); // Convert to plain JavaScript objects

      // Transform the incidents to include all fields

      const total = await Incident.countDocuments();

      res.status(200).json({
        success: true,
        data: incidents,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error: any) {
      console.error("Error fetching incidents:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch incidents",
        error: error.message,
      });
    }
  }

  static async getUserIncidents(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const userId = req.user?.id;

      const incidents = await Incident.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Incident.countDocuments({ userId });

      res.json({
        incidents,
        total,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getIncidentById(req: Request, res: Response) {
    try {
      const incident = await Incident.findById(req.params.id).populate(
        "userId",
        "name email"
      );

      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }

      res.json(incident);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateIncident(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const incident = await Incident.findById(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }

      // Check if user is the owner
      if (incident.userId.toString() !== req.user?.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Get existing images
      const existingImages = incident.images || [];

      // Update incident with new data and images
      const updatedIncident = await Incident.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          images: req.body.images || existingImages,
        },
        { new: true }
      );

      // Create notification for all users
      const users = await User.find();

      const notifications = users.map((user) => ({
        userId: user._id,
        type: "incident_updated",
        message: `Incident updated: ${updatedIncident?.title}`,
        incidentId: updatedIncident?._id,
      }));

      await Notification.insertMany(notifications);

      res.json(updatedIncident);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async deleteIncident(req: Request, res: Response) {
    try {
      const incident = await Incident.findById(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }

      // Check if user is the owner
      if (incident.userId.toString() !== req.user?.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await Incident.findByIdAndDelete(req.params.id);
      res.json({ message: "Incident deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getIncidentsByCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;

      // Validate category ID
      if (!isValidObjectId(categoryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      // Get pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Get sorting parameters
      const sortBy = (req.query.sortBy as string) || "createdAt";
      const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

      // Build filter
      const filter: any = { category: categoryId };

      // Add status filter if provided
      if (req.query.status) {
        filter.status = req.query.status;
      }

      // Get total count for pagination
      const total = await Incident.countDocuments(filter);

      // Get incidents with pagination and sorting
      const incidents = await Incident.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate("category", "name")
        .populate("reporter", "firstName lastName")
        .populate("assignedTo", "firstName lastName");

      res.status(200).json({
        success: true,
        data: incidents,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching incidents by category:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch incidents",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async uploadIncidentImages(req: Request, res: Response) {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No image files provided",
        });
      }

      const incidentId = req.params.id;
      const incident = await Incident.findById(incidentId);

      if (!incident) {
        return res.status(404).json({
          success: false,
          message: "Incident not found",
        });
      }

      // Check if user is the owner
      if (incident.userId.toString() !== req.user?.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const uploadedImages = [];
      incident.images = incident.images || [];

      // Process each file
      for (const file of req.files) {
        const fileBuffer = file.buffer;
        const fileName = `${uuidv4()}-${file.originalname}`;
        const dropboxPath = `/incidents/${incidentId}/${fileName}`;

        // Upload to Dropbox
        await dropbox.filesUpload({
          path: dropboxPath,
          contents: fileBuffer,
        });

        // Get shared link
        const sharedLink = await dropbox.sharingCreateSharedLinkWithSettings({
          path: dropboxPath,
        });

        // Update incident with new image
        const imageUrl = sharedLink.result.url.replace("dl=0", "raw=1");
        incident.images.push(imageUrl);
        uploadedImages.push(imageUrl);
      }

      await incident.save();

      res.status(200).json({
        success: true,
        message: "Images uploaded successfully",
        data: {
          imageUrls: uploadedImages,
        },
      });
    } catch (error) {
      console.error("Error uploading incident images:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload images",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async deleteIncidentImages(req: Request, res: Response) {
    try {
      const { incidentId } = req.params;
      const { imageUrls } = req.body;

      if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No image URLs provided",
        });
      }

      const incident = await Incident.findById(incidentId);

      if (!incident) {
        return res.status(404).json({
          success: false,
          message: "Incident not found",
        });
      }

      // Check if user is the owner
      if (incident.userId.toString() !== req.user?.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Process each image URL
      for (const imageUrl of imageUrls) {
        try {
          // Extract file path from Dropbox URL
          const url = new URL(imageUrl);
          const path = url.pathname.split("/").pop();
          const dropboxPath = `/incidents/${incidentId}/${path}`;

          // Delete from Dropbox
          await dropbox.filesDeleteV2({
            path: dropboxPath,
          });
        } catch (error) {
          console.error(`Error deleting image ${imageUrl}:`, error);
          // Continue with other images even if one fails
        }
      }

      // Remove all specified images from incident
      incident.images = incident.images.filter(
        (img) => !imageUrls.includes(img)
      );
      await incident.save();

      res.status(200).json({
        success: true,
        message: "Images deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting incident images:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete images",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getIncidentStats(req: Request, res: Response) {
    try {
      // Get all categories
      const categories = await Category.find().select("_id name");

      // Get incident counts for each category
      const stats: Record<string, number> = {};
      let total = 0;

      for (const category of categories) {
        const count = await Incident.countDocuments({ category: category._id });
        stats[category.name] = count;
        total += count;
      }

      res.status(200).json({
        success: true,
        data: {
          stats,
          total,
        },
      });
    } catch (error: any) {
      console.error("Error fetching incident statistics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch incident statistics",
        error: error.message,
      });
    }
  }
}
