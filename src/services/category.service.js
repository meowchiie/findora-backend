const { Category } = require('../models');

class CategoryService {
    static async create(payload) {
        return await Category.create(payload);
    }

    static async findAll() {
        return await Category.findAll({
            order: [['name', 'ASC']] // Mengurutkan nama kategori secara alfabetis (A-Z)
        });
    }

    static async findById(id) {
        return await Category.findByPk(id);
    }

    static async update(id, payload) {
        const category = await Category.findByPk(id);
        if (!category) throw new Error("Kategori tidak ditemukan");

        await category.update(payload);
        return category;
    }

    static async delete(id) {
        const category = await Category.findByPk(id);
        if (!category) throw new Error("Kategori tidak ditemukan");

        await category.destroy();
        return true;
    }
}

module.exports = CategoryService;