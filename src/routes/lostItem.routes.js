// routes/lostItem.routes.js

const express = require("express");
const router = express.Router();

const LostItemController = require("../controllers/lostItem.controller");
const { uploadLostItemMiddleware } = require("../middlewares/upload.middleware");
const { validateLostItem } = require("../validators/lostitem.validator");

// CREATE
router.post("/", uploadLostItemMiddleware, validateLostItem, LostItemController.create);

// GET ALL
router.get("/", LostItemController.getAll);

// GET BY ID
router.get("/:id", LostItemController.getById);

// UPDATE
router.put("/:id", uploadLostItemMiddleware, validateLostItem, LostItemController.update);

// DELETE
router.delete("/:id", LostItemController.delete);

module.exports = router;