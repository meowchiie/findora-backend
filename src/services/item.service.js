const { Item, User, Category } = require('../models');

class ItemService {
  static async create(payload) {
    if (!payload.status) payload.status = 'Menunggu'; // Default status
    return await Item.create(payload);
  }

  // Menambahkan parameter page dan limit dengan default value
  static async findAll(filter = {}, page = 1, limit = 10) {
    // Pastikan nilainya berupa integer
    const limitData = parseInt(limit, 10);
    const pageData = parseInt(page, 10);
    
    // Hitung offset (data mulai dari index ke berapa)
    const offset = (pageData - 1) * limitData;

    // Gunakan findAndCountAll agar mendapat total keseluruhan data (count) dan datanya (rows)
    const { count, rows } = await Item.findAndCountAll({
      where: filter,
      include: [
        { model: User, attributes: ['id', 'name', 'email', 'nim'] },
        { model: Category, attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']], // Pastikan penulisan kolom ini sesuai dengan database Anda (bisa 'createdAt' atau 'created_at')
      limit: limitData,
      offset: offset
    });

    // Format kembalian agar memuat metadata pagination
    return {
      totalItems: count,
      totalPages: Math.ceil(count / limitData),
      currentPage: pageData,
      data: rows
    };
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