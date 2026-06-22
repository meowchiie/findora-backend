const { Item, Category, Claim, User, sequelize } = require('../models');
const { Op } = require('sequelize');

class DashboardController {
  async getChartData(req, res) {
    try {
      // ==========================================
      // 1. DATA UNTUK DOUGHNUT CHART (Relasi Model Category)
      // ==========================================
      const categoryLabels = [];
      const categoryData = [];

      const categoryCounts = await Item.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('Item.id')), 'total']
        ],
        include: [{
          model: Category,
          // HAPUS baris "as: 'category'" karena tidak pakai alias khusus
          attributes: ['name'] 
        }],
        // UBAH ke huruf kapital 'C' sesuai dengan nama Model default
        group: ['Category.id', 'Category.name'] 
      });

      categoryCounts.forEach(item => {
        // UBAH item.category menjadi item.Category (huruf kapital C)
        const catName = item.Category && item.Category.name ? item.Category.name : 'Lainnya';
        const total = parseInt(item.dataValues.total, 10);

        const existingIndex = categoryLabels.indexOf(catName);
        if (existingIndex !== -1) {
          categoryData[existingIndex] += total;
        } else {
          categoryLabels.push(catName);
          categoryData.push(total);
        }
      });

      // ==========================================
      // 2. DATA UNTUK BAR CHART (Bulan Ini)
      // ==========================================
      const currentYear = new Date().getFullYear();
      const monthLabels = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      
      const lostData = new Array(12).fill(0);
      const foundData = new Array(12).fill(0);

      const thisYearItems = await Item.findAll({
        where: {
          created_at: {
            [Op.gte]: new Date(`${currentYear}-01-01`),
            [Op.lte]: new Date(`${currentYear}-12-31 23:59:59`)
          }
        },
        // Pastikan 'type' dipanggil di sini
        attributes: ['type', 'created_at'] 
      });


      thisYearItems.forEach(item => {
        // ✅ AMBIL DATA DARI dataValues
        const createdAt = item.dataValues.created_at;
        const type = item.dataValues.type;
        
        // Dapatkan index bulan (0 = Januari, 1 = Februari, dst)
        const monthIndex = new Date(createdAt).getMonth();
        
        // Ubah type menjadi huruf kecil untuk pengecekan
        const currentType = type ? type.toLowerCase() : '';

        if (currentType === 'hilang') {
          lostData[monthIndex] += 1;
        } else if (currentType === 'ditemukan') {
          foundData[monthIndex] += 1;
        }
      });

    const totalLost = await Item.count({ where: { type: 'hilang' } });
    const totalFound = await Item.count({ where: { type: 'ditemukan' } });
    const pendingClaims = await Claim.count({ where: { status: 'Menunggu Verifikasi' } });
    const totalUsers = await User.count(); // Menghitung seluruh user terdaftar

    return res.status(200).json({
      success: true,
      charts: {
        doughnut: { labels: categoryLabels, data: categoryData },
        bar: { labels: monthLabels, lostData, foundData }
      },
      // ✅ Kirimkan objek stats ini bersama response chart
      stats: {
        totalLost,
        totalFound,
        pendingClaims,
        totalUsers
      }
    });

    } catch (error) {
      console.error("Error Get Chart Data:", error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data chart' + error });
    }
  }
}

module.exports = new DashboardController();