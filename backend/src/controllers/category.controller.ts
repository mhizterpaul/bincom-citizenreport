import { Request, Response } from "express";
import { Category, ICategory } from "../models/category.model";
import { validationResult } from "express-validator";

export class CategoryController {
  static async createCategory(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description } = req.body;

      // Check if category already exists
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ message: "Category already exists" });
      }

      const category = new Category({
        name,
        description,
      });

      await category.save();
      res.status(201).json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await Category.find().select("_id name");

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch categories",
        error: error.message,
      });
    }
  }

  static async getCategoryById(req: Request, res: Response) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const { name, description } = req.body;

      // Check if new name conflicts with existing category
      if (name !== category.name) {
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
          return res
            .status(400)
            .json({ message: "Category name already exists" });
        }
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        { name, description },
        { new: true }
      );

      res.json(updatedCategory);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      await Category.findByIdAndDelete(req.params.id);
      res.json({ message: "Category deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
