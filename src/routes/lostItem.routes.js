// routes/lostItem.routes.js

const express = require("express");
const router = express.Router();

const LostItemController = require("../controllers/lostItem.controller");

// CREATE
router.post("/", LostItemController.create);

// GET ALL
router.get("/", LostItemController.getAll);

// GET BY ID
router.get("/:id", LostItemController.getById);

// UPDATE
router.put("/:id", LostItemController.update);

// DELETE
router.delete("/:id", LostItemController.delete);

module.exports = router;