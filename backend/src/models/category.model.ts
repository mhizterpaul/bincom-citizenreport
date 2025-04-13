import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot be more than 50 characters'],
    },
    description: {
      type: String,
      required: [false, 'Category description is required'],
      trim: true,
      maxlength: [200, 'Description cannot be more than 200 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for name-based queries
categorySchema.index({ name: 1 }, { unique: true });

export const Category = mongoose.model<ICategory>('Category', categorySchema); 