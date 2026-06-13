const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('./config/database');
const User = require('./src/models/user');

const lostItemRoutes = require("./src/routes/lostItem.routes");

const app = express();


// =========================
// MIDDLEWARE
// =========================
app.use(cors());
app.use(express.json());


// =========================
// DATABASE CONNECTION
// =========================
async function connectDatabase() {
    try {
        // Hanya test koneksi database, TIDAK MENGGUNAKAN sync() lagi
        await db.authenticate();
        console.log('✅ Database connected successfully (No Sync)');

    } catch (error) {
        console.error('❌ Database not ready:', error.message);
        console.log('🔄 Retrying connection in 5 seconds...');
        setTimeout(connectDatabase, 5000);
    }
}

// Jalankan koneksi database
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

// Lost Item Routes
app.use("/lost-items", lostItemRoutes);


// =========================
// REGISTER
// =========================
app.post('/api/register', async (req, res) => {

    try {

        const { nama, email, role, nim, password } = req.body;

        // Cek email
        const userExists = await User.findOne({
            where: { email }
        });

        if (userExists) {
            return res.status(400).json({
                message: "Email sudah terdaftar!"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        await User.create({
            nama,
            email,
            role,
            nim,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User berhasil dibuat! Silakan login."
        });

    } catch (error) {

        res.status(500).json({
            message: "Gagal registrasi: " + error.message
        });
    }
});


// =========================
// LOGIN
// =========================
app.post('/api/login', async (req, res) => {

    try {

        const { email, password } = req.body;

        // Cari user
        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({
                message: "User tidak ditemukan!"
            });
        }

        // Validasi password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Password salah!"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role
            },
            'rahasia_findora',
            {
                expiresIn: '1d'
            }
            );

            res.status(200).json({
            message: "Login Berhasil!",
            token,
            user: {
                id: user.id,
                nama: user.nama,
                nim: user.nim,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        res.status(500).json({
            message: "Gagal login: " + error.message
        });
    }
});


// =========================
// FORGOT PASSWORD
// =========================
app.post('/api/forgot-password', async (req, res) => {

    try {

        const { email } = req.body;

        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({
                message: "Email tidak ditemukan dalam sistem kami."
            });
        }

        res.status(200).json({
            message: "Tautan pemulihan telah dikirim ke email anda!"
        });

    } catch (error) {

        res.status(500).json({
            message: "Gagal memproses permintaan lupa kata sandi."
        });
    }
});


// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `🚀 Server Backend FINDORA berjalan di http://localhost:${PORT}`
    );
});