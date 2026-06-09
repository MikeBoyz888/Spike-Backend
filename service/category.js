const Category = require('../models/category');

const createCategory = async ({ name, slug }) => {
    if (!name) {
        throw new Error('Category name is required');
    }

    const normalizedSlug = slug || name.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category = new Category({ name, slug: normalizedSlug });
    return await category.save();
};

const getCategories = async () => {
    return await Category.find();
};

const deleteCategory = async (id) => {
    return await Category.findByIdAndDelete(id);
};

const updateCategory = async (id, data) => {
    return await Category.findByIdAndUpdate(id, data, { new: true });
};

module.exports = {
    createCategory,
    getCategories,
    deleteCategory,
    updateCategory
};
