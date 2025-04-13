import mongoose, { Document, Schema } from "mongoose";

export interface IIncident extends Document {
  title: string;
  description: string;
  category: string;
  location: {
    type: string;
    coordinates: number[];
  };
  status: "pending" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  images: string[];
  userId: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const incidentSchema = new Schema<IIncident>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "closed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    images: [
      {
        type: String,
      },
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
incidentSchema.index({ location: "2dsphere" });

// Index for category-based queries
incidentSchema.index({ category: 1 });

// Index for user-based queries
incidentSchema.index({ userId: 1 });

export const Incident = mongoose.model<IIncident>("Incident", incidentSchema);
