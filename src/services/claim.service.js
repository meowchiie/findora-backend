const { Claim, Item, User } = require('../models');

class ClaimService {
    static async create(data) {
        // Cek dulu apakah item-nya eksis
        const item = await Item.findByPk(data.item_id);
        if (!item) throw new Error("Item yang ingin diklaim tidak ditemukan");
        
        if (item.status === 'Selesai' || item.status === 'Diklaim') {
            throw new Error("Item ini sudah selesai diproses atau diklaim oleh orang lain");
        }

        return await Claim.create(data);
    }

    static async getAll(filter = {}) {
        return await Claim.findAll({
            where: filter,
            include: [
                { model: Item, attributes: ['id', 'name', 'status', 'type'] },
                { model: User, attributes: ['id', 'name', 'nim', 'email'] }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    static async getById(id) {
        const claim = await Claim.findByPk(id, {
            include: [
                { model: Item, attributes: ['id', 'name', 'status', 'type', 'photo_path'] },
                { model: User, attributes: ['id', 'name', 'nim', 'email'] }
            ]
        });
        if (!claim) throw new Error("Data klaim tidak ditemukan");
        return claim;
    }
}

module.exports = ClaimService;