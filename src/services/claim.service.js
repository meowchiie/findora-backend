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

    static async getAll(filter, page, limit, status, category_id) {
        const offset = (page - 1) * limit;

        // 1. Kondisi filter untuk tabel Claims (seperti status)
        const claimWhere = { ...filter };
        if (status) {
            claimWhere.status = status;
        }

        // 2. Kondisi filter untuk Eager Loading tabel Items
        const itemInclude = {
            model: Item,
            attributes: ['id', 'name', 'location', 'created_at']
        };

        // 🛠️ JIKA FRONTEND MENGIRIMKAN CATEGORY_ID, FILTER DI SINI:
        if (category_id) {
            itemInclude.where = { category_id: category_id }; // Menyesuaikan foreign key di tabel item kamu
        }

        const { count, rows } = await Claim.findAndCountAll({
            where: claimWhere,
            limit: limit,
            offset: offset,
            include: [
                itemInclude, // Masukkan objek include item yang sudah dinamis
                {
                    model: User,
                    attributes: ['id', 'name']
                }
            ],
            order: [['id', 'DESC']]
        });

        return {
            claims: rows,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        };
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