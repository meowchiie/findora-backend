const ActivityService = require('../services/activity.service');

class ActivityController {
    
    // Dipanggil saat user membuka tab aktivitas di Frontend
    static async getMyActivities(req, res) {
        try {
            // Asumsi req.user.id didapat dari middleware autentikasi (JWT)
            // Atau jika dikirim via params/query: const userId = req.params.userId;
            const userId = req.user.id; 
            
            const activities = await ActivityService.getUserActivities(userId);
            
            return res.status(200).json({
                success: true,
                message: "Berhasil mengambil riwayat aktivitas",
                data: activities
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getAll(req, res) {
        try {            
            const page = req.query.page || 1;
            const limit = req.query.limit || 5;

            const activities = await ActivityService.getAll(page, limit);
            
            return res.status(200).json({
                success: true,
                message: "Berhasil mengambil riwayat aktivitas",
                data: activities
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // Endpoint untuk membuat activity (Bisa juga dipanggil secara internal di service lain)
    static async create(req, res) {
        try {
            const { user_id, detail } = req.body;
            const newActivity = await ActivityService.createActivity({ user_id, detail });
            
            return res.status(201).json({
                success: true,
                message: "Aktivitas berhasil dicatat",
                data: newActivity
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = ActivityController;