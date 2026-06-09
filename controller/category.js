const categoryService = require('../service/category');
const Category = require('../models/category');

const createCategory = async (req, res) => { //tạo category mới
    try {
        const categoryData = req.body;
        const savedCategory = await categoryService.createCategory(categoryData);

        res.status(201).json({
            success: true,
            message: 'Category created successfully!',
            data: savedCategory
        });
    } catch (error) {
        console.log('Error creating category:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getCategories = async (req, res) => { // read category
    try {
        const categories = await categoryService.getCategories(); //tìm category trong db
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        await categoryService.deleteCategory(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Deleted!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const updated = await categoryService.updateCategory(req.params.id, req.body);
        res.status(200).json({
            success: true,
            data: updated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createCategory,
    getCategories,
    deleteCategory,
    updateCategory
};