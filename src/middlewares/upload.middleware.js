const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder penyimpanan tersedia, jika belum ada maka otomatis dibuat
const uploadDir = path.join('public', 'uploads', 'lost-items');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. Konfigurasi Storage (Tempat & Nama File)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // File disimpan di public/uploads/lost-items
    },
    filename: (req, file, cb) => {
        // Membuat nama unik: lost-item-timestamp.ekstensi
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `lost-item-${uniqueSuffix}${ext}`);
    }
});

// 2. Filter Tipe File (Hanya Gambar)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        // Melempar error spesifik Multer jika tipe file tidak didukung
        const error = new Error('Hanya diperbolehkan mengunggah file gambar (jpg, jpeg, png, webp)!');
        error.code = 'LIMIT_FILE_TYPES';
        return cb(error, false);
    }
};

// 3. Inisialisasi Multer Instance
const uploadLostItemPhoto = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // Batasan ukuran file: Maksimal 2MB
    },
    fileFilter: fileFilter
}).single('photo_path'); // Menangkap satu file dari field key bernama 'photo_path'


// 4. Wrapper Middleware untuk Penanganan Error Multer yang Elegan
const uploadLostItemMiddleware = (req, res, next) => {
    uploadLostItemPhoto(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Error bawaan dari Multer (misal: File kegedean)
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'Ukuran file terlalu besar! Maksimal batas ukuran adalah 2MB.'
                });
            }
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            // Error kustom dari fileFilter kita
            if (err.code === 'LIMIT_FILE_TYPES') {
                return res.status(400).json({ success: false, message: err.message });
            }
            return res.status(500).json({ success: false, message: err.message });
        }
        
        // Jika file berhasil diupload, lanjut ke validator teks dan controller
        next();
    });
};

module.exports = { uploadLostItemMiddleware };