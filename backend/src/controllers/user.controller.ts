import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Dropbox } from "dropbox";
import { Readable } from "stream";

// Initialize Dropbox client with your credentials
const dropbox = new Dropbox({
  clientId: process.env.DROPBOX_CLIENT_ID,
  clientSecret: process.env.DROPBOX_CLIENT_SECRET,
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
});

class UserController {
  static async getUserInfo(req: Request, res: Response) {
    try {
      if (!req.user?._id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findById(req.user._id).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          image: user.image,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user?._id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { firstName, lastName } = req.body;
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { firstName, lastName },
        { new: true, runValidators: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          image: user.image,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async addProfileImage(req: Request, res: Response) {
    try {
      if (!req.user?._id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const file = req.file;
      const userId = req.user._id;

      // Convert buffer to stream
      const fileStream = Readable.from(file.buffer);

      // Create folder if it doesn't exist
      const folderPath = `/profile_images/${userId}`;
      try {
        await dropbox.filesCreateFolderV2({ path: folderPath });
      } catch (error) {
        // Folder might already exist, which is fine
      }

      // Upload to Dropbox
      const dropboxPath = `${folderPath}/${Date.now()}-${file.originalname}`;
      const response = await dropbox.filesUpload({
        path: dropboxPath,
        contents: fileStream,
        mode: { ".tag": "overwrite" },
      });

      // Get shared link
      const sharedLink = await dropbox.sharingCreateSharedLinkWithSettings({
        path: response.result.path_display!,
        settings: {
          requested_visibility: { ".tag": "public" },
          audience: { ".tag": "public" },
          access: { ".tag": "viewer" },
        },
      });

      // Update user profile
      const user = await User.findByIdAndUpdate(
        userId,
        { image: sharedLink.result.url },
        { new: true }
      ).select("-password");

      res.json({
        user: {
          id: user?._id,
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          image: user?.image,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async removeProfileImage(req: Request, res: Response) {
    try {
      if (!req.user?._id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findById(req.user._id);
      if (!user || !user.image) {
        return res.status(404).json({ message: "No profile image found" });
      }

      // Extract file path from Dropbox URL
      const dropboxPath = user.image.split("/file/")[1].split("?")[0];

      // Delete from Dropbox
      await dropbox.filesDeleteV2({
        path: dropboxPath,
      });

      // Update user profile
      user.image = undefined;
      await user.save();

      res.json({
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default UserController;
