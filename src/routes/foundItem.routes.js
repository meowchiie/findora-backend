const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const foundItemController = require("../controllers/foundItem.controller");

// Konfigurasi Penyimpanan Gambar Khusus Found Items
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/found-items/"); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, "found-item-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// UBAH DARI upload.single("photo") MENJADI upload.single("image")
router.post("/", upload.single("image"), foundItemController.createFoundItem);

module.exports = router;