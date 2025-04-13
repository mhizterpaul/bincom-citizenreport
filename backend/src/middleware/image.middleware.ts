import { Request, Response, NextFunction } from "express";
import { dropbox } from "../config/dropbox.config";
import { v4 as uuidv4 } from "uuid";

const createIncidentDirectory = async (incidentId: string) => {
  const incidentPath = `/Apps/citizen-report/incidents/${incidentId}`;
  try {
    await dropbox.filesCreateFolderV2({ path: incidentPath });
  } catch (error: any) {
    // Ignore error if folder already exists
    if (error?.status !== 409) {
      throw error;
    }
  }
  return incidentPath;
};

// Function to make JSON safe for HTTP headers
const httpHeaderSafeJson = (v: any) => {
  return JSON.stringify(v).replace(/[\u007f-\uffff]/g, (c) => {
    return "\\u" + ("000" + c.charCodeAt(0).toString(16)).slice(-4);
  });
};

export const processImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return next();
    }

    const uploadedImageUrls = [];
    const incidentId = req.body.incidentId || "temp";

    // Create incident-specific directory
    const incidentPath = await createIncidentDirectory(incidentId);

    for (const file of req.files as Express.Multer.File[]) {
      try {
        // Generate a unique filename
        const fileName = `${uuidv4()}-${file.originalname}`;
        const dropboxPath = `${incidentPath}/${fileName}`;

        // Upload to Dropbox
        const uploadResponse = await dropbox.filesUpload({
          path: dropboxPath,
          contents: file.buffer,
          mode: { ".tag": "add" },
          autorename: true,
          mute: false,
          strict_conflict: false,
        });

        // Ensure we have a valid path from the upload response
        if (!uploadResponse.result.path_display) {
          throw new Error("Failed to get uploaded file path");
        }

        const uploadedFilePath = uploadResponse.result.path_display;

        // Create a shared link
        const sharedLinkResponse =
          await dropbox.sharingCreateSharedLinkWithSettings({
            path: uploadedFilePath,
            settings: {
              requested_visibility: { ".tag": "public" },
              audience: { ".tag": "public" },
              access: { ".tag": "viewer" },
            },
          });

        // Convert the shared link to a direct download link
        // Replace dl=0 with raw=1 and remove any other parameters
        const sharedUrl = sharedLinkResponse.result.url;
        const directUrl = sharedUrl.replace("dl=0", "raw=1");

        uploadedImageUrls.push(directUrl);
      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        throw error;
      }
    }

    // Attach only the URLs to the request body
    req.body.images = uploadedImageUrls;

    next();
  } catch (error) {
    console.error("Error processing images:", error);
    res.status(500).json({
      success: false,
      message: "Error processing images",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
