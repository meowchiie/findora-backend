const { Activity, User } = require('../models');

class ActivityService {
    // Menyimpan aktivitas baru
    static async createActivity(payload) {
        return await Activity.create(payload);
    }

    // Mengambil riwayat aktivitas berdasarkan user_id (Terbaru di atas)
    static async getUserActivities(userId, page = 1, limit = 5) {
        const offset = (page - 1) * limit;

        const { count, rows } = await Activity.findAndCountAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']], 
            limit: limit,
            offset: offset, // Melompati data berdasarkan halaman saat ini
            include: [{
                model: User,
                as: 'user',
                attributes: ['name', 'profile_picture']
            }]
        });

        return {
            activities: rows,
            currentPage: Number(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count
        };
    }

    static async getAll(page = 1, limit = 5) {
        const offset = (page - 1) * limit;

        const { count, rows } = await Activity.findAndCountAll({
            order: [['created_at', 'DESC']], 
            limit: limit,
            offset: offset, // Melompati data berdasarkan halaman saat ini
            include: [{
                model: User,
                as: 'user',
                attributes: ['name', 'profile_picture']
            }]
        });

        return {
            activities: rows,
            currentPage: Number(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count
        };
    }
}

module.exports = ActivityService;