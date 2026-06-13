const request = require('supertest');
const express = require('express');
const db = require('../config/database');
const fs = require('fs').promises;
const LostItem = require('../src/models/lostitem');
const LostItemService = require('../src/services/lostItem.service');
const lostItemRoutes = require('../src/routes/lostItem.routes');

const app = express();
app.use(express.json());
app.use('/lost-items', lostItemRoutes);

let targetId;
let itemIdWithPhoto;

beforeAll(async () => {
  await db.authenticate();
  await LostItem.destroy({ where: {}, truncate: true });
});

afterAll(async () => {
  await db.close();
});

describe('=== LOST ITEM COMPREHENSIVE COVERAGE & REGRESSION TEST ===', () => {

  // ==========================================
  // LOGIKA UTAMA (HAPPY PATH & BASIC EDGE CASES)
  // ==========================================
  
  it('TC01 - Happy Path: Harus berhasil membuat lost item baru dengan gambar', async () => {
    const res = await request(app)
      .post('/lost-items')
      .field('name', 'Dompet Coklat')
      .field('description', 'Berisi KTP')
      .field('category', 'Dokumen')
      .field('location', 'Kantin')
      .field('lost_date', '2026-06-14')
      .field('lost_time', '12:30')
      .field('contact', '08123456789')
      .attach('photo_path', Buffer.from('dummy content'), 'dompet.jpg');

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    targetId = res.body.data.id;
  });

  it('TC02 - Edge Case: Harus gagal jika field wajib (name) kosong', async () => {
    const res = await request(app)
      .post('/lost-items')
      .field('description', 'Tanpa nama')
      .field('category', 'Umum')
      .field('location', 'Kelas')
      .field('lost_date', '2026-06-14')
      .field('lost_time', '12:30')
      .field('contact', '08123');

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('TC03 - Happy Path: Harus berhasil mengambil seluruh daftar lost items', async () => {
    const res = await request(app).get('/lost-items');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('TC04 - Happy Path: Struktur data list harus sesuai dengan spesifikasi model', async () => {
    const res = await request(app).get('/lost-items');
    expect(res.body.data[0]).toHaveProperty('name');
  });

  it('TC05 - Happy Path: Harus berhasil mengambil 1 data spesifik berdasarkan ID', async () => {
    const res = await request(app).get(`/lost-items/${targetId}`);
    expect(res.statusCode).toBe(200);
  });

  it('TC06 - Edge Case: Harus mengembalikan 404 jika ID tidak eksis', async () => {
    const res = await request(app).get('/lost-items/999999');
    expect(res.statusCode).toBe(404);
  });

  it('TC07 - Happy Path: Harus berhasil mengubah deskripsi data lost item', async () => {
    const res = await request(app)
      .put(`/lost-items/${targetId}`)
      .field('name', 'Dompet Kulit Coklat Premium')
      .field('description', 'Deskripsi diperbarui')
      .field('category', 'Dokumen')
      .field('location', 'Kantin')
      .field('lost_date', '2026-06-14')
      .field('lost_time', '12:30')
      .field('contact', '08123456789');

    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe('Dompet Kulit Coklat Premium');
  });

  it('TC08 - Edge Case: Harus gagal update jika format lost_date salah', async () => {
    const res = await request(app)
      .put(`/lost-items/${targetId}`)
      .field('lost_date', '14-06-2026'); // Format salah

    expect(res.statusCode).toBe(400);
  });

  it('TC09 - Edge Case: Harus gagal menghapus jika ID salah/tidak ditemukan', async () => {
    const res = await request(app).delete('/lost-items/888888');
    expect(res.statusCode).toBe(404);
  });

  it('TC10 - Happy Path: Harus berhasil menghapus lost item secara permanen', async () => {
    const res = await request(app).delete(`/lost-items/${targetId}`);
    expect(res.statusCode).toBe(200);
  });

  // ==========================================
  // PENINGKATAN COVERAGE (SUNTIKAN EKSTRA EDGES & ERRORS)
  // ==========================================

  it('TC11 - Service Coverage: Menghapus file lama saat melakukan update foto baru', async () => {
    // 1. Buat data awal yang memiliki foto terlebih dahulu
    const item = await LostItem.create({
      name: 'Kunci', description: 'Hilang', category: 'Lainnya',
      location: 'Lab', lost_date: '2026-06-14', lost_time: '10:00',
      contact: '081', photo_path: 'public/uploads/lost-items/foto_lama.jpg'
    });
    itemIdWithPhoto = item.id;

    // Spy on internal method _deleteFile untuk memastikan ia dipanggil
    const deleteSpy = jest.spyOn(LostItemService, '_deleteFile').mockImplementation(async () => {});

    // 2. Lakukan update dengan menyertakan simulasi berkas baru
    await request(app)
      .put(`/lost-items/${itemIdWithPhoto}`)
      .field('name', 'Kunci Motor')
      .field('description', 'Hilang')
      .field('category', 'Lainnya')
      .field('location', 'Lab')
      .field('lost_date', '2026-06-14')
      .field('lost_time', '10:00')
      .field('contact', '081')
      .attach('photo_path', Buffer.from('new file'), 'foto_baru.jpg');

    expect(deleteSpy).toHaveBeenCalledWith('public/uploads/lost-items/foto_lama.jpg');
    deleteSpy.mockRestore();
  });

  it('TC12 - Service Coverage: Menghapus file baru yang masuk jika ID target UPDATE ternyata tidak ditemukan', async () => {
    const deleteSpy = jest.spyOn(LostItemService, '_deleteFile').mockImplementation(async () => {});
    
    const res = await request(app)
      .put('/lost-items/999111') // ID sembarang yang tidak ada di DB
      .field('name', 'Barang Gaib')
      .field('description', 'Deskripsi barang gaib')
      .field('category', 'Lainnya')
      .field('location', 'Lab')
      .field('lost_date', '2026-06-14')
      .field('lost_time', '10:00')
      .field('contact', '08123')
      .attach('photo_path', Buffer.from('temp'), 'ghost.jpg');

    expect(res.statusCode).toBe(404); // Sekarang pasti lolos validator teks dan mengembalikan 404 dari Service
    expect(deleteSpy).toHaveBeenCalled();
    deleteSpy.mockRestore();
  });

  it('TC13 - Validator Coverage: Menghapus berkas jika validasi teks express-validator gagal', async () => {
    const unlinkSpy = jest.spyOn(fs, 'unlink').mockResolvedValue();

    const res = await request(app)
      .post('/lost-items')
      .field('name', '') // ❌ Memicu error validasi (Nama wajib diisi)
      .attach('photo_path', Buffer.from('test data'), 'invalid_form.jpg');

    expect(res.statusCode).toBe(400);
    expect(unlinkSpy).toHaveBeenCalled();
    unlinkSpy.mockRestore();
  });

  it('TC14 - Validator Coverage: Menguji catch block ketika fs.unlink gagal membersihkan berkas sampah', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const unlinkSpy = jest.spyOn(fs, 'unlink').mockRejectedValue(new Error('Disk Write Protected'));

    await request(app)
      .post('/lost-items')
      .field('name', '') // Gagal validasi teks
      .attach('photo_path', Buffer.from('test data'), 'broken_system.jpg');

    expect(consoleSpy).toHaveBeenCalled();
    unlinkSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('TC15 - Helper Coverage: Menguji catch block pada metode internal _deleteFile', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const unlinkSpy = jest.spyOn(fs, 'unlink').mockRejectedValue(new Error('Permission Denied'));
    
    // Mengirimkan null/undefined akan memaksa path.resolve melempar TypeError 
    // ke dalam catch block secara instan tanpa memedulikan kondisi eksternal lingkungan os Windows/Linux
    await LostItemService._deleteFile(null);
    
    expect(consoleSpy).toHaveBeenCalled();
    unlinkSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  // ==========================================
  // CONTROLLER COVERAGE (SIMULASI INTERNAL SERVER ERROR 500)
  // ==========================================

  it('TC16 - Controller Coverage: Menangani Error 500 pada fungsi Create', async () => {
    const serviceSpy = jest.spyOn(LostItemService, 'create').mockRejectedValue(new Error('DB Connection Timeout'));
    
    const res = await request(app)
      .post('/lost-items')
      .field('name', 'Test Error')
      .field('description', 'Test Error')
      .field('category', 'Test Error')
      .field('location', 'Test Error')
      .field('lost_date', '2026-06-14')
      .field('lost_time', '12:30')
      .field('contact', '0812');

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('DB Connection Timeout');
    serviceSpy.mockRestore();
  });

  it('TC17 - Controller Coverage: Menangani Error 500 pada fungsi GetAll', async () => {
    const serviceSpy = jest.spyOn(LostItemService, 'findAll').mockRejectedValue(new Error('Fatal Error'));
    const res = await request(app).get('/lost-items');
    expect(res.statusCode).toBe(500);
    serviceSpy.mockRestore();
  });

  it('TC18 - Controller Coverage: Menangani Error 500 pada fungsi GetById', async () => {
    const serviceSpy = jest.spyOn(LostItemService, 'findById').mockRejectedValue(new Error('Fatal Error'));
    const res = await request(app).get('/lost-items/1');
    expect(res.statusCode).toBe(500);
    serviceSpy.mockRestore();
  });

  it('TC19 - Controller Coverage: Menangani Error 500 umum pada fungsi Update', async () => {
    const serviceSpy = jest.spyOn(LostItemService, 'update').mockRejectedValue(new Error('Fatal Error'));
    const res = await request(app)
      .put(`/lost-items/${itemIdWithPhoto}`)
      .field('name', 'Update Error')
      .field('description', 'Update Error')
      .field('category', 'Update Error')
      .field('location', 'Update Error')
      .field('lost_date', '2026-06-14')
      .field('lost_time', '12:30')
      .field('contact', '0812');
      
    expect(res.statusCode).toBe(500);
    serviceSpy.mockRestore();
  });

  it('TC20 - Controller Coverage: Menangani Error 500 umum pada fungsi Delete', async () => {
    const serviceSpy = jest.spyOn(LostItemService, 'delete').mockRejectedValue(new Error('Fatal Error'));
    const res = await request(app).delete('/lost-items/1');
    expect(res.statusCode).toBe(500);
    serviceSpy.mockRestore();
  });
});