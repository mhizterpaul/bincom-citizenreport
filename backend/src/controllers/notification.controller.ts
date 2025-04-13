import { Request, Response } from "express";
import { Notification } from "../models/notification.model";

export class NotificationController {
  static async getUserNotifications(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const userId = req.user?._id;

      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("incidentId", "title");

      const total = await Notification.countDocuments({ userId });

      res.json({
        notifications,
        total,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getUnreadNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?._id;

      const notifications = await Notification.find({
        userId,
        read: false,
      })
        .sort({ createdAt: -1 })
        .populate("incidentId", "title");

      res.json({ notifications });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const notification = await Notification.findById(req.params.id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      // Check if user owns the notification
      if (notification.userId.toString() !== req.user?._id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedNotification = await Notification.findByIdAndUpdate(
        req.params.id,
        { read: true },
        { new: true }
      );

      res.json(updatedNotification);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?._id;

      await Notification.updateMany({ userId, read: false }, { read: true });

      res.json({ message: "All notifications marked as read" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async deleteNotification(req: Request, res: Response) {
    try {
      const notification = await Notification.findById(req.params.id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      // Check if user owns the notification
      if (notification.userId.toString() !== req.user?._id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await Notification.findByIdAndDelete(req.params.id);
      res.json({ message: "Notification deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
