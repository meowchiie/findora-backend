const jwt = require('jsonwebtoken');

// 1. Middleware untuk mengecek apakah user sudah login (punya token yang valid)
const verifyToken = (req, res, next) => {
    // Mengambil token dari header Authorization (Format: Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Akses ditolak! Anda harus login terlebih dahulu." 
        });
    }

    try {
        // 'rahasia_findora' harus sama dengan yang ada di UserService saat login
        const decoded = jwt.verify(token, 'rahasia_findora'); 
        req.user = decoded; // Menyimpan data token (seperti userId dan role) ke dalam request
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: "Token tidak valid atau sudah kedaluwarsa! Silakan login kembali." 
        });
    }
};

// 2. Middleware untuk mengecek apakah user yang login adalah seorang Admin
const isAdmin = (req, res, next) => {
    // Pastikan middleware verifyToken dipanggil sebelum isAdmin
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            message: "Akses ditolak! Data user tidak ditemukan." 
        });
    }

    if (req.user.role !== 'Admin') {
        return res.status(403).json({ 
            success: false, 
            message: "Akses ditolak! Aksi ini hanya dapat dilakukan oleh Admin." 
        });
    }

    next();
};

module.exports = { verifyToken, isAdmin };