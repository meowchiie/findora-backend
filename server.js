const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize'); // 💡 KOREKSI: Pindahkan ke paling atas agar global dan tidak error saat dipanggil di Route

const db = require('./config/database');
const User = require('./src/models/user');

// Import Routes
const userRoutes = require("./src/routes/user.routes");
const categoryRoutes = require("./src/routes/category.routes");
const itemRoutes = require("./src/routes/item.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const claimRoutes = require("./src/routes/claim.routes");
const verificationRoutes = require("./src/routes/verification.routes");

const app = express();

// =========================
// MIDDLEWARE & STATIC FOLDERS
// =========================
app.use(cors());
app.use('/public', express.static('public')); // Akses gambar via http://localhost:5000/public/...
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// =========================
// DATABASE CONNECTION
// =========================
async function connectDatabase() {
    try {
        await db.authenticate();
        console.log('✅ Database connected successfully (No Sync)');
    } catch (error) {
        console.error('❌ Database not ready:', error.message);
        console.log('🔄 Retrying connection in 5 seconds...');
        setTimeout(connectDatabase, 5000);
    }
}

connectDatabase();

// =========================
// ROUTES
// =========================

// Root Endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Backend FINDORA Running'
    });
});

// Fitur Lost & Found Routes
app.use("/api", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/verifications", verificationRoutes);


// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server Backend FINDORA berjalan di http://localhost:${PORT}`);
});