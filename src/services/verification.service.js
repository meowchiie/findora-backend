const { Verification, Claim, Item, sequelize } = require('../models');
const ActivityService = require('./activity.service');

class VerificationService {
    static async create(data) {
        // Menggunakan database Transaction agar proses sinkronisasi status aman & tidak parsial
        const t = await sequelize.transaction();

        try {
            // 1. Cek keberadaan data klaim (Mengambil data Item sekaligus)
            const claim = await Claim.findByPk(data.claim_id, { 
                include: [Item],
                transaction: t // Amankan pembacaan data di dalam transaksi
            });
            
            if (!claim) throw new Error("Data klaim tidak ditemukan");
            if (claim.status !== 'Menunggu Verifikasi') throw new Error("Klaim ini sudah pernah diverifikasi sebelumnya");

            // 2. Buat record data verifikasi
            const verification = await Verification.create(data, { transaction: t });

            // 3. Update status pada tabel CLAIMS sesuai keputusan admin
            await claim.update({ status: data.status }, { transaction: t });

            // Ambil nama barang dengan aman dari eager loading
            const namaBarang = claim.Item ? claim.Item.name : 'Barang';
            let detailAktivitas = '';

            // 4. Sinkronisasi status pada tabel ITEMS & tentukan kalimat aktivitas
            if (data.status === 'Diverifikasi') {
                // Jika disetujui, ubah status barang menjadi 'Selesai'
                await Item.update(
                    { status: 'Selesai' }, 
                    { where: { id: claim.item_id }, transaction: t }
                );
                
                // Kalimat aktivitas jika klaim disetujui
                detailAktivitas = `✅️ Barang (${namaBarang}) berhasil dikembalikan kepada pemilik`;
            } else {
                // Jika ditolak, kembalikan status barang menjadi 'Menunggu' agar bisa diklaim orang lain lagi
                await Item.update(
                    { status: 'Menunggu' }, 
                    { where: { id: claim.item_id }, transaction: t }
                );

                // Kalimat aktivitas jika klaim ditolak admin
                detailAktivitas = `❌ Klaim untuk barang (${namaBarang}) ditolak/tidak valid setelah diverifikasi`;
            }

            // 5. Catat ke tabel aktivitas milik USER YANG MENGKLAIM
            // Menggunakan claim.user_id agar log ini muncul di widget aktivitas milik user tersebut
            await ActivityService.createActivity({
                user_id: claim.user_id, 
                detail: detailAktivitas
            }, { transaction: t });

            // Jika semua langkah sukses, simpan permanen ke database
            await t.commit();
            return verification;
            
        } catch (error) {
            // Jika ada salah satu yang gagal, batalkan seluruh rangkaian di atas
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