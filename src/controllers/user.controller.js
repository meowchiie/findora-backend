const { Op } = require('sequelize');
const UserService = require('../services/user.service');
const { matchedData } = require('express-validator');
const { User } = require('../models'); // Destructuring dari index.js models

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

    static async getAllUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const search = req.query.search || '';

            const result = await UserService.getAllUsers(page, limit, search);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async adminCreate(req, res) {
        try {
            const payload = matchedData(req);
            const result = await UserService.adminCreate(payload);
            return res.status(201).json({ success: true, message: "User baru berhasil ditambahkan!", data: result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    static async adminUpdate(req, res) {
        try {
            const { id } = req.params;
            const payload = matchedData(req);
            const result = await UserService.adminUpdate(id, payload);
            return res.status(200).json({ success: true, message: "Data pengguna berhasil diperbarui!", data: result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    static async adminDelete(req, res) {
        try {
            const { id } = req.params;
            await UserService.adminDelete(id);
            return res.status(200).json({ success: true, message: "Pengguna berhasil dihapus dari sistem!" });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
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

    static async getArchivedUsers(req, res) {
    try {
      const { search } = req.query;
      
      let whereClause = {
        deleted_at: { [Op.ne]: null } // Mencari yang data deleted_at-nya BERISI (di-soft delete)
      };

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { nim: { [Op.like]: `%${search}%` } }
        ];
      }

      const archivedUsers = await User.findAll({
        where: whereClause,
        paranoid: false // WAJIB: Agar data yang ter-soft delete bisa lolos sensor query
      });

      return res.status(200).json({
        success: true,
        users: archivedUsers
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 2. Soft Delete User (Mengubah fungsi delete lama Anda agar tidak langsung lenyap)
   */
  static async softDeleteUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }

      // Tandai status text menjadi Nonaktif
      user.status = 'Nonaktif';
      await user.save();

      // Memicu paranoid soft delete (mengisi timestamp di deleted_at)
      await user.destroy(); 

      return res.status(200).json({ success: true, message: 'User berhasil diarsipkan (Soft Delete)' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 3. Endpoint BARU: Restore User (Dipanggil dari tombol ↺ di halaman ArchiveData)
   */
  static async restoreUser(req, res) {
    try {
      const { id } = req.params;

      // Cari user di barisan data yang sudah terhapus (paranoid: false)
      const user = await User.findByPk(id, { paranoid: false });

      if (!user) {
        return res.status(404).json({ success: false, message: 'Data arsip user tidak ditemukan' });
      }

      // Kembalikan data (deleted_at di-set jadi NULL kembali)
      await user.restore();

      // Kembalikan status tampilan ke Aktif
      user.status = 'Aktif';
      await user.save();

      return res.status(200).json({ success: true, message: 'User berhasil dipulihkan kembali' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 4. Hard Delete User (Dipanggil dari tombol 🗑 di halaman ArchiveData)
   */
  static async hardDeleteUserPermanent(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, { paranoid: false });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan di database' });
      }

      // Paksa hapus permanen dari baris database menggunakan { force: true }
      await user.destroy({ force: true });

      return res.status(200).json({ success: true, message: 'User telah dihapus permanen dari database' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = UserController;