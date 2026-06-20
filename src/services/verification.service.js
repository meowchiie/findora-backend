const { Verification, Claim, Item, sequelize } = require('../models');

class VerificationService {
    static async create(data) {
        // Menggunakan database Transaction agar proses sinkronisasi status aman & tidak parsial
        const t = await sequelize.transaction();

        try {
            // 1. Cek keberadaan data klaim
            const claim = await Claim.findByPk(data.claim_id, { include: [Item] });
            if (!claim) throw new Error("Data klaim tidak ditemukan");
            if (claim.status !== 'Menunggu Verifikasi') throw new Error("Klaim ini sudah pernah diverifikasi sebelumnya");

            // 2. Buat record data verifikasi
            const verification = await Verification.create(data, { transaction: t });

            // 3. Update status pada tabel CLAIMS sesuai keputusan admin
            await claim.update({ status: data.status }, { transaction: t });

            // 4. Sinkronisasi status pada tabel ITEMS secara otomatis jika disetujui
            if (data.status === 'Disetujui') {
                // Jika disetujui, ubah status barang menjadi 'Diklaim' atau 'Selesai'
                await Item.update(
                    { status: 'Selesai' }, 
                    { where: { id: claim.item_id }, transaction: t }
                );
            }

            await t.commit();
            return verification;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    static async getAll() {
        return await Verification.findAll({
            include: [{ model: Claim, include: [Item] }],
            order: [['verified_at', 'DESC']]
        });
    }
}

module.exports = VerificationService;