const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Konfigurasi Storage Universal untuk Items
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Folder penyimpanan disatukan agar rapi
        const uploadDir = path.join('public', 'uploads', 'items');
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        // Membaca type dari body (Syarat: Di Frontend, field text 'type' harus dikirim SEBELUM file)
        // Nilai type berdasarkan ERD adalah 'hilang' atau 'ditemukan'
        const prefix = req.body.type === 'ditemukan' ? 'found-item' : 'lost-item';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        
        cb(null, `${prefix}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        const error = new Error('Hanya diperbolehkan mengunggah file gambar (jpg, jpeg, png, webp)!');
        error.code = 'LIMIT_FILE_TYPES';
        return cb(error, false);
    }
};

const uploadPhotoInstance = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5MB
    fileFilter: fileFilter
});

// 2. Wrapper Middleware untuk Item Photo
const uploadItemMiddleware = (req, res, next) => {
    // Menggunakan .single('item_photo') karena sekarang field di database sudah disatukan
    const upload = uploadPhotoInstance.single('photo_path');

    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'Ukuran file terlalu besar! Maksimal batas ukuran adalah 5MB.'
                });
            }
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            // Menangkap error dari fileFilter
            if (err.code === 'LIMIT_FILE_TYPES') {
                 return res.status(400).json({ success: false, message: err.message });
            }
            return res.status(500).json({ success: false, message: err.message });
        }
        
        next();
    });
};

module.exports = { uploadItemMiddleware };