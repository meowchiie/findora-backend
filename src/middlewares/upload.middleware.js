const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Fungsi pembantu untuk membuat direktori jika belum ada
const createDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Filter file universal (Hanya gambar)
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

// Batasan ukuran file (5MB)
const limits = { fileSize: 5 * 1024 * 1024 };

// ==========================================
// 1. KONFIGURASI UNTUK ITEMS
// ==========================================
const itemStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join('public', 'uploads', 'items');
        createDir(uploadDir);
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        const prefix = req.body.type === 'ditemukan' ? 'found-item' : 'lost-item';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const uploadItemInstance = multer({ storage: itemStorage, limits, fileFilter });

const uploadItemMiddleware = (req, res, next) => {
    uploadItemInstance.single('photo_path')(req, res, (err) => {
        if (err) return handleMulterError(err, res, next);
        next();
    });
};

// ==========================================
// 2. KONFIGURASI UNTUK CLAIMS (BUKTI FOTO)
// ==========================================
const claimStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join('public', 'uploads', 'claims');
        createDir(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `proof-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const uploadClaimInstance = multer({ storage: claimStorage, limits, fileFilter });

const uploadClaimMiddleware = (req, res, next) => {
    uploadClaimInstance.single('proof_photo_path')(req, res, (err) => {
        if (err) return handleMulterError(err, res, next);
        next();
    });
};

// Fungsi penanganan error multer universal
const handleMulterError = (err, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Ukuran file terlalu besar! Maksimal batas ukuran adalah 5MB.'
            });
        }
        return res.status(400).json({ success: false, message: err.message });
    }
    if (err.code === 'LIMIT_FILE_TYPES') {
        return res.status(400).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: err.message });
};

// ==========================================
// 3. KONFIGURASI UNTUK FOTO PROFIL
// ==========================================
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join('public', 'uploads', 'profiles');
        createDir(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const uploadProfileInstance = multer({ storage: profileStorage, limits, fileFilter });

const uploadProfileMiddleware = (req, res, next) => {
    uploadProfileInstance.single('fotoProfil')(req, res, (err) => {
        if (err) return handleMulterError(err, res, next);
        next();
    });
};

module.exports = { uploadItemMiddleware, uploadClaimMiddleware , uploadProfileMiddleware};