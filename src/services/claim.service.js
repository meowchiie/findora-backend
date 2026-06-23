const { Claim, Item, User, sequelize } = require('../models');
const ActivityService = require('./activity.service');

class ClaimService {
    static async create(data) {
        // 1. Mulai Transaksi Sequelize
        const t = await sequelize.transaction();

        try {
            // 2. Cek dulu apakah item-nya eksis (masukkan objek transaksi 't')
            const item = await Item.findByPk(data.item_id, { transaction: t });
            if (!item) {
                throw new Error("Item yang ingin diklaim tidak ditemukan");
            }
            
            if (item.status === 'Selesai' || item.status === 'Diklaim') {
                throw new Error("Item ini sudah selesai diproses atau diklaim oleh orang lain");
            }

            // 3. PERBAIKAN: Tambahkan 'await' dan masukkan ke dalam transaksi 't'
            await item.update({ "status": "Diklaim" }, { transaction: t });

            // 4. Buat data klaim baru
            const newClaim = await Claim.create(data, { transaction: t });

            // 5. Ambil nama user yang mengajukan klaim untuk log aktivitas
            // Catatan: Pastikan di payload 'data' dari controller sudah membawa 'user_id' (req.user.id)
            const user = await User.findByPk(data.user_id, { transaction: t });
            const userName = user ? user.name : 'Seseorang';

            // 6. Susun kalimat aktivitas sesuai contoh yang kamu inginkan
            const detailAktivitas = `${userName} mengajukan klaim untuk barang: ${item.name}`;

            // 7. Simpan log aktivitas ke database
            await ActivityService.createActivity({
                user_id: data.user_id, // Dicatat sebagai aktivitas milik user yang mengklaim
                detail: detailAktivitas
            }, { transaction: t });

            // Jika semua langkah di atas berhasil tanpa error, simpan permanen (Commit)
            await t.commit();

            return newClaim;

        } catch (error) {
            // Jika ada satu saja yang gagal (misal item tidak ketemu atau gagal simpan log), 
            // batalkan semua perubahan di atas (Rollback)
            await t.rollback();
            throw error; // Lemparkan error agar ditangkap oleh try-catch di Controller
        }
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
            attributes: ['id', 'name','photo_path', 'location', 'type','created_at']
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