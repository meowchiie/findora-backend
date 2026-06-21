const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

class UserService {
    static async register(payload) {
        const { name, email, nim, role, password } = payload;

        // Cek duplikasi data
        const userExists = await User.findOne({
            where: { [Op.or]: [{ name }, { email }, { nim }] }
        });

        if (userExists) {
            if (userExists.name === name) throw new Error("name lengkap sudah digunakan!");
            if (userExists.email === email) throw new Error("Email sudah terdaftar!");
            if (userExists.nim === nim) throw new Error("NIM / NIP sudah terdaftar!");
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        return await User.create({
            name,
            email,
            role,
            nim,
            password: hashedPassword,
            profile_picture: null 
        });
    }

    static async login(identifier, password) {
        const user = await User.findOne({
            where: { [Op.or]: [{ email: identifier }, { nim: identifier }] }
        });

        if (!user) throw new Error("Akun dengan Email atau NIM tersebut tidak ditemukan!");

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new Error("Password salah!");

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            'rahasia_findora', // Idealnya pindahkan ini ke file .env
            { expiresIn: '1d' }
        );

        return { user, token };
    }

    // Tambahkan di dalam class UserService

    static async getAllUsers(page, limit, search) {
        const offset = (page - 1) * limit;
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { nim: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            limit: limit,
            offset: offset,
            attributes: ['id', 'name', 'email', 'nim', 'role', 'status'],
            order: [['id', 'DESC']]
        });

        // Hitung statistik riil dari database untuk kartu informasi
        const totalMahasiswa = await User.count({ where: { role: 'Mahasiswa' } });
        const totalDosen = await User.count({ where: { role: 'Dosen' } });
        const totalStaff = await User.count({ where: { role: 'Staff' } });

        return {
            users: rows,
            stats: { totalMahasiswa, totalDosen, totalStaff, totalUsers: count },
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            }
        };
    }

    static async adminCreate(payload) {
        // Enkripsi password default/baru yang ditentukan admin
        const salt = await bcrypt.genSalt(10);
        payload.password = await bcrypt.hash(payload.password, salt);
        payload.status = payload.status || 'Aktif';

        return await User.create(payload);
    }

    static async adminUpdate(id, payload) {
        const user = await User.findByPk(id);
        if (!user) throw new Error("User tidak ditemukan!");
        
        await user.update(payload);
        return user;
    }

    static async adminDelete(id) {
        const user = await User.findByPk(id);
        if (!user) throw new Error("User tidak ditemukan!");
        
        return await user.destroy();
    }

    static async getProfile(id) {
        const user = await User.findByPk(id, {
            attributes: ['id', 'name', 'email', 'nim', 'role', 'profile_picture'] 
        });
        if (!user) throw new Error("User tidak ditemukan!");
        return user;
    }

    static async updateProfile(payload) {
        const { id, name, email, nim, passwordBaru, fotoProfil } = payload;
        const user = await User.findByPk(id);

        if (!user) throw new Error("User tidak ditemukan!");

        if (email !== user.email) {
            const emailCheck = await User.findOne({ where: { email } });
            if (emailCheck) throw new Error("Email baru sudah terdaftar oleh pengguna lain!");
        }

        let dataToUpdate = { name, email, nim, profile_picture: fotoProfil };

        if (passwordBaru && passwordBaru.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            dataToUpdate.password = await bcrypt.hash(passwordBaru, salt);
        }

        await user.update(dataToUpdate);
        return user;
    }

    static async forgotPassword(email) {
        const user = await User.findOne({ where: { email } });
        if (!user) throw new Error("Email tidak ditemukan dalam sistem kami.");
        
        // Di sini nantinya kamu bisa menambahkan logika pengiriman email via Nodemailer
        return true;
    }
}

module.exports = UserService;