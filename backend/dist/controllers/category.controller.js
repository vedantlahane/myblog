"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryTree = exports.deleteCategory = exports.updateCategory = exports.getCategoryBySlug = exports.getCategoryById = exports.getCategories = exports.createCategory = void 0;
const category_model_1 = require("../models/category.model");
const createCategory = async (req, res) => {
    try {
        const { name, description, parentCategory, icon, isActive = true, order = 0 } = req.body;
        // Only admins can create categories
        if (!req.user.isAdmin) {
            res.status(403).json({ error: 'Only admins can create categories' });
            return;
        }
        const category = await category_model_1.Category.create({
            name,
            description,
            parentCategory,
            icon,
            isActive,
            order
        });
        await category.populate('parentCategory', 'name slug');
        res.status(201).json(category);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createCategory = createCategory;
const getCategories = async (req, res) => {
    try {
        const { isActive, parentCategory } = req.query;
        const query = {};
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        if (parentCategory) {
            query.parentCategory = parentCategory === 'null' ? null : parentCategory;
        }
        const categories = await category_model_1.Category.find(query)
            .populate('parentCategory', 'name slug')
            .sort({ order: 1, name: 1 });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCategories = getCategories;
const getCategoryById = async (req, res) => {
    try {
        const category = await category_model_1.Category.findById(req.params.id)
            .populate('parentCategory', 'name slug');
        if (!category) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCategoryById = getCategoryById;
const getCategoryBySlug = async (req, res) => {
    try {
        const category = await category_model_1.Category.findOne({ slug: req.params.slug })
            .populate('parentCategory', 'name slug');
        if (!category) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCategoryBySlug = getCategoryBySlug;
const updateCategory = async (req, res) => {
    try {
        // Only admins can update categories
        if (!req.user.isAdmin) {
            res.status(403).json({ error: 'Only admins can update categories' });
            return;
        }
        const category = await category_model_1.Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('parentCategory', 'name slug');
        if (!category) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }
        res.json(category);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        // Only admins can delete categories
        if (!req.user.isAdmin) {
            res.status(403).json({ error: 'Only admins can delete categories' });
            return;
        }
        const category = await category_model_1.Category.findById(req.params.id);
        if (!category) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }
        // Check if category has subcategories
        const hasSubcategories = await category_model_1.Category.countDocuments({ parentCategory: category._id });
        if (hasSubcategories > 0) {
            res.status(400).json({ error: 'Cannot delete category with subcategories' });
            return;
        }
        await category_model_1.Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteCategory = deleteCategory;
const getCategoryTree = async (_req, res) => {
    try {
        const categories = await category_model_1.Category.find({ isActive: true })
            .populate('parentCategory', 'name slug')
            .sort({ order: 1, name: 1 });
        // Build category tree
        const categoryMap = new Map();
        const tree = [];
        // First pass: create map of all categories
        categories.forEach((cat) => {
            categoryMap.set(cat._id.toString(), { ...cat.toObject(), children: [] });
        });
        // Second pass: build tree structure
        categories.forEach((cat) => {
            const categoryObj = categoryMap.get(cat._id.toString());
            if (cat.parentCategory) {
                const parent = categoryMap.get(cat.parentCategory._id.toString());
                if (parent) {
                    parent.children.push(categoryObj);
                }
            }
            else {
                tree.push(categoryObj);
            }
        });
        res.json(tree);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCategoryTree = getCategoryTree;
