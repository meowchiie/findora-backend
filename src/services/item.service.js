const { Item, User, Category } = require('../models');

class ItemService {
    static async create(payload) {
        if (!payload.status) payload.status = 'Menunggu'; // Default status
        return await Item.create(payload);
    }

    static async findAll(filter = {}) {
        return await Item.findAll({
            where: filter,
            include: [
                { model: User, attributes: ['id', 'name', 'email', 'nim'] },
                { model: Category, attributes: ['id', 'name'] }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    static async findById(id) {
        return await Item.findByPk(id, {
            include: [
                { model: User, attributes: ['id', 'name', 'email', 'nim'] },
                { model: Category, attributes: ['id', 'name'] }
            ]
        });
    }

    static async update(id, payload) {
        const item = await Item.findByPk(id);
        if (!item) throw new Error("Item not found");
        
        await item.update(payload);
        return item;
    }

    static async delete(id) {
        const item = await Item.findByPk(id);
        if (!item) throw new Error("Item not found");
        
        await item.destroy();
        return true;
    }
}

module.exports = ItemService;