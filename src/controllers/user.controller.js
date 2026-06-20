const UserService = require('../services/user.service');
const { matchedData } = require('express-validator');

class UserController {
    static async register(req, res) {
        try {
            const payload = matchedData(req);
            await UserService.register(payload);
            
            return res.status(201).json({ message: "User berhasil dibuat! Silakan login." });
        } catch (error) {
            const statusCode = error.message.includes("sudah") ? 400 : 500;
            return res.status(statusCode).json({ message: error.message });
        }
    }

    static async login(req, res) {
        try {
            const { identifier, password } = matchedData(req);
            const { user, token } = await UserService.login(identifier, password);
            
            return res.status(200).json({
                message: "Login Berhasil!",
                token,
                user: {
                    id: user.id,
                    nama: user.nama,
                    nim: user.nim,
                    email: user.email,
                    role: user.role,
                    fotoProfil: user.foto_profil 
                }
            });
        } catch (error) {
            const statusCode = error.message.includes("salah") || error.message.includes("tidak ditemukan") ? 401 : 500;
            return res.status(statusCode).json({ message: error.message });
        }
    }

    static async getProfile(req, res) {
        try {
            const user = await UserService.getProfile(req.params.id);
            return res.status(200).json(user);
        } catch (error) {
            return res.status(error.message === "User tidak ditemukan!" ? 404 : 500).json({ message: error.message });
        }
    }

    static async updateProfile(req, res) {
        try {
            const payload = matchedData(req);
            await UserService.updateProfile(payload);
            
            return res.status(200).json({ message: "Profil Anda berhasil diperbarui di database!" });
        } catch (error) {
            const statusCode = error.message.includes("tidak ditemukan") ? 404 : (error.message.includes("terdaftar") ? 400 : 500);
            return res.status(statusCode).json({ message: error.message });
        }
    }

    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ message: "Email wajib diisi" });

            await UserService.forgotPassword(email);
            return res.status(200).json({ message: "Tautan pemulihan telah dikirim ke email anda!" });
        } catch (error) {
            return res.status(error.message.includes("tidak ditemukan") ? 404 : 500).json({ message: error.message });
        }
    }
}

module.exports = UserController;