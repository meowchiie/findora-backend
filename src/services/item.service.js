const { Item, User, Category, sequelize } = require('../models');
const ActivityService = require('./activity.service');

class ItemService {
  static async create(payload) {
    // 1. Logika asli kamu tetap dipertahankan di paling atas
    if (!payload.status) payload.status = 'Menunggu'; 

    // 2. Jalankan transaksi Sequelize
    const t = await sequelize.transaction();

    try {
      // 3. Simpan barang baru ke database (masukkan objek transaksi 't')
      const newItem = await Item.create(payload, { transaction: t });

      // 4. Ambil data User untuk mendapatkan nama lengkapnya
      // Catatan: Sesuaikan 'payload.user_id' dengan nama foreign key di database kamu (misal: userId atau user_id)
      const user = await User.findByPk(payload.user_id, { transaction: t });
      const userName = user ? user.name : 'Seseorang';

      // 5. Tentukan kalimat berdasarkan tipe laporan (Hilang / Ditemukan)
      // Catatan: Sesuaikan 'payload.tipe_laporan' dengan kolom penanda di model kamu (misal: type, category, dll)
      const jenisLaporan = payload.tipe_laporan === 'hilang' ? 'kehilangan' : 'menemukan';
      const detailAktivitas = `${userName} melaporkan ${jenisLaporan} barang: ${newItem.name}`;

      // 6. Catat ke tabel aktivitas
      await ActivityService.createActivity({
        user_id: payload.user_id,
        detail: detailAktivitas
      }, { transaction: t });

      // Jika pembuatan barang & pencatatan aktivitas sukses, simpan permanen (Commit)
      await t.commit();
      
      // Kembalikan data item yang baru dibuat seperti semula
      return newItem;

    } catch (error) {
      // Jika salah satu proses di atas error, batalkan semua perubahan (Rollback)
      await t.rollback();
      throw error; // Lemparkan error ke Controller agar ditangkap oleh try-catch di sana
    }
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