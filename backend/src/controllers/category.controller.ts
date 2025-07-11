import { Request, Response } from 'express';
import { Category } from '../models/category.model';
import { isValidObjectId } from 'mongoose';

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, parentCategory, icon, isActive = true, order = 0 } = req.body;

    // Only admins can create categories
    if (!req.user!.isAdmin) {
      res.status(403).json({ error: 'Only admins can create categories' });
      return;
    }

    const category = await Category.create({
      name,
      description,
      parentCategory,
      icon,
      isActive,
      order
    });

    await category.populate('parentCategory', 'name slug');
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isActive, parentCategory } = req.query;

    const query: any = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (parentCategory) {
      query.parentCategory = parentCategory === 'null' ? null : parentCategory;
    }

    const categories = await Category.find(query)
      .populate('parentCategory', 'name slug')
      .sort({ order: 1, name: 1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name slug');
    
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findOne({ slug: req.params.slug })
      .populate('parentCategory', 'name slug');
    
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only admins can update categories
    if (!req.user!.isAdmin) {
      res.status(403).json({ error: 'Only admins can update categories' });
      return;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name slug');

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json(category);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only admins can delete categories
    if (!req.user!.isAdmin) {
      res.status(403).json({ error: 'Only admins can delete categories' });
      return;
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // Check if category has subcategories
    const hasSubcategories = await Category.countDocuments({ parentCategory: category._id });
    if (hasSubcategories > 0) {
      res.status(400).json({ error: 'Cannot delete category with subcategories' });
      return;
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getCategoryTree = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory', 'name slug')
      .sort({ order: 1, name: 1 });

    // Build category tree
    const categoryMap = new Map();
    const tree: any[] = [];

    // First pass: create map of all categories
    categories.forEach((cat: any) => {
      categoryMap.set(cat._id.toString(), { ...cat.toObject(), children: [] });
    });

    // Second pass: build tree structure
    categories.forEach((cat: any) => {
      const categoryObj = categoryMap.get(cat._id.toString());
      if (cat.parentCategory) {
        const parent = categoryMap.get(cat.parentCategory._id.toString());
        if (parent) {
          parent.children.push(categoryObj);
        }
      } else {
        tree.push(categoryObj);
      }
    });

    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
