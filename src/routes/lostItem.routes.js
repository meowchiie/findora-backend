// src/routes/lostItem.routes.js

const express = require("express");
const router = express.Router();

const LostItemController = require("../controllers/lostItem.controller");
const { uploadItemMiddleware  } = require("../middlewares/upload.middleware");
const { validateLostItem } = require("../validators/lostitem.validator");

// === DETEKSI OTOMATIS SIAPA YANG UNDEFINED ===
console.log("\n====== HASIL PENGECEKAN IMPORT ======");
console.log("1. LostItemController :", LostItemController ? "AMAN (Eksis)" : "❌ UNDEFINED");
console.log("-> LostItemController.create :", LostItemController && LostItemController.create ? "AMAN (Eksis)" : "❌ UNDEFINED");
console.log("2. uploadItemMiddleware  :", uploadItemMiddleware  ? "AMAN (Eksis)" : "❌ UNDEFINED");
console.log("3. validateLostItem :", validateLostItem ? "AMAN (Eksis)" : "❌ UNDEFINED");
console.log("=====================================\n");

// CREATE
router.post("/", uploadItemMiddleware , validateLostItem, LostItemController.create);

// GET ALL
router.get("/", LostItemController.getAll);

// GET BY ID
router.get("/:id", LostItemController.getById);

// UPDATE
router.put("/:id", uploadItemMiddleware , validateLostItem, LostItemController.update);

// DELETE
router.delete("/:id", LostItemController.delete);

module.exports = router;