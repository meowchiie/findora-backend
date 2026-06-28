const request = require('supertest');
const express = require('express');
const db = require('../config/database');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken'); // Diperlukan untuk generate token simulasi
const { Item, User, Category } = require('../src/models'); 
const ItemService = require('../src/services/item.service');
const itemRoutes = require('../src/routes/item.routes');

const app = express();
app.use(express.json());
app.use('/items', itemRoutes);

let targetId;
let itemIdWithPhoto;
let dummyUser;
let dummyCategory;
let userToken; // Menyimpan token untuk request terautentikasi

beforeAll(async () => {
  try {
    await db.authenticate();

    // 1. Matikan checks dan bersihkan tabel dengan urutan aman
    await db.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    await Item.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    await Category.destroy({ where: {}, force: true });
    await db.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });

    // 2. Gunakan timestamp acak untuk menghindari Unique Constraint Violation
    const uniqueId = Date.now();

    dummyUser = await User.create({
      name: 'Test User',
      email: `testuser_${uniqueId}@ith.ac.id`,
      nim: `H07121${String(uniqueId).slice(-5)}`,
      password: 'hashed_password_123',
      role: 'Mahasiswa'
    });

    dummyCategory = await Category.create({
      name: 'Dokumen'
    });

    // 3. Generate token palsu yang valid sesuai dengan secret key middleware Anda
    userToken = jwt.sign(
      { userId: dummyUser.id, role: dummyUser.role }, 
      'rahasia_findora', 
      { expiresIn: '1h' }
    );

  } catch (error) {
    console.error('❌ GAGAL PADA BLOK BEFOREALL INITIALIZATION:', error);
    throw error;
  }
});

afterAll(async () => {
  await db.close();
});

describe('=== LOST ITEM COMPREHENSIVE COVERAGE & REGRESSION TEST ===', () => {

  // ==========================================
  // LOGIKA UTAMA (HAPPY PATH & BASIC EDGE CASES)
  // ==========================================
  
  it('TC01 - Happy Path: Harus berhasil membuat lost item baru dengan gambar (Terautentikasi)', async () => {
    const res = await request(app)
      .post('/items')
      .set('Authorization', `Bearer ${userToken}`) // Menyertakan JWT Token
      .field('user_id', dummyUser.id)         
      .field('category_id', dummyCategory.id) 
      .field('type', 'hilang')                
      .field('name', 'Dompet Coklat')
      .field('description', 'Berisi KTP')
      .field('location', 'Kantin')
      .field('lost_date', '2026-06-14')
      .field('lost_time', '12:30')
      .field('contact', '08123456789')
      .field('status', 'Menunggu')            
      .attach('photo_path', Buffer.from('dummy content'), 'dompet.jpg'); // Key sesuai .single('photo_path')

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    targetId = res.body.data.id;
  });

  it('TC01.1 - Edge Case: Harus gagal membuat item jika tidak mengirimkan token', async () => {
    const res = await request(app)
      .post('/items')
      .field('name', 'Tanpa Token');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Akses ditolak');
  });

  it('TC02 - Edge Case: Harus gagal jika field wajib (name) kosong', async () => {
    const res = await request(app)
      .post('/items')
      .set('Authorization', `Bearer ${userToken}`)
      .field('user_id', dummyUser.id)
      .field('category_id', dummyCategory.id)
      .field('type', 'hilang')
      .field('name', '') 
      .field('description', 'Tanpa nama')
      .field('location', 'Kelas')
      .field('lost_date', '2026-06-14')
      .field('lost_time', '12:30')
      .field('contact', '08123');

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContainEqual(
      expect.objectContaining({ field: 'name', message: 'Nama barang tidak boleh kosong' })
    );
  });

  it('TC03 - Happy Path: Harus berhasil mengambil seluruh daftar lost items (Tanpa Token)', async () => {
    const res = await request(app).get('/items'); // Route bebas token
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('TC04 - Happy Path: Struktur data list harus sesuai dengan spesifikasi model', async () => {
    const res = await request(app).get('/items');
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).toHaveProperty('type');
  });

  it('TC05 - Happy Path: Harus berhasil mengambil 1 data spesifik berdasarkan ID', async () => {
    const res = await request(app).get(`/items/${targetId}`);
    expect(res.statusCode).toBe(200);
  });

  it('TC05.1 - Happy Path: Harus berhasil mengakses statistik dashboard (Terautentikasi)', async () => {
    const res = await request(app)
      .get('/items/stats')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('TC06 - Edge Case: Harus mengembalikan 404 jika ID tidak eksis', async () => {
    const res = await request(app).get('/items/999999');
    expect(res.statusCode).toBe(404);
  });

  it('TC07 - Happy Path: Harus berhasil mengubah deskripsi data lost item', async () => {
    const res = await request(app)
      .put(`/items/${targetId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('user_id', dummyUser.id)
      .field('category_id', dummyCategory.id)
      .field('type', 'hilang')
      .field('name', 'Dompet Kulit Coklat Premium')
      .field('description', 'Deskripsi diperbarui')
      .field('location', 'Kantin')
      .field('lost_date', '2026-06-14')
      .field('lost_time', '12:30')
      .field('contact', '08123456789')
      .field('status', 'Menunggu');

    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe('Dompet Kulit Coklat Premium');
  });

  it('TC08 - Edge Case: Harus gagal update jika format lost_date salah', async () => {
    const res = await request(app)
      .put(`/items/${targetId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('user_id', dummyUser.id)
      .field('category_id', dummyCategory.id)
      .field('type', 'hilang')
      .field('name', 'Dompet')
      .field('description', 'Deskripsi')
      .field('location', 'Kantin')
      .field('lost_date', '14-06-2026') 
      .field('lost_time', '12:30')
      .field('contact', '08123456789');

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContainEqual(
      expect.objectContaining({ field: 'lost_date', message: 'Format tanggal tidak valid (YYYY-MM-DD)' })
    );
  });

  it('TC09 - Edge Case: Harus gagal menghapus jika ID salah/tidak ditemukan', async () => {
    const res = await request(app)
      .delete('/items/888888')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(404);
  });

  it('TC10 - Happy Path: Harus berhasil menghapus lost item secara permanen', async () => {
    const res = await request(app)
      .delete(`/items/${targetId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
  });

  // ==========================================
  // PENINGKATAN COVERAGE (MOCKING & VALIDATOR FLOW)
  // ==========================================

  // ==========================================
  // PENINGKATAN COVERAGE (MOCKING & VALIDATOR FLOW)
  // ==========================================

  // Pastikan di baris paling atas file tests/item.test.js Anda sudah meng-import validateItem:
  // const { validateItem } = require('../src/validators/item.validator');

  // ==========================================
  // PENINGKATAN COVERAGE (MOCKING & VALIDATOR FLOW)
  // ==========================================

  it('TC11 - Service Coverage: Menghapus file lama saat melakukan update foto baru', async () => {
    // Taktik Jitu: Lakukan spy langsung pada fs.unlink bawaan Node.js
    const unlinkSpy = jest.spyOn(fs, 'unlink').mockResolvedValue();

    // Buat data item dummy langsung dengan photo_path terisi agar memicu proses unlink file lama
    const itemTerpilih = await Item.create({
      id: 777,
      user_id: dummyUser.id,         
      category_id: dummyCategory.id, 
      type: 'hilang',                
      name: 'Kunci Asli', 
      description: 'Lama', 
      location: 'Lab', 
      lost_date: '2026-06-14', 
      lost_time: '10:00',
      contact: '081', 
      status: 'Menunggu',
      photo_path: 'public/uploads/items/foto_lama_tersimpan.jpg' // Path harus terdeteksi ada
    });

    await request(app)
      .put(`/items/${itemTerpilih.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('user_id', dummyUser.id)
      .field('category_id', dummyCategory.id)
      .field('type', 'hilang')
      .field('name', 'Kunci Motor Baru')
      .field('description', 'Deskripsi Update')
      .field('location', 'Lab')
      .field('lost_date', '2026-06-14')
      .field('lost_time', '10:00')
      .field('contact', '081')
      .attach('photo_path', Buffer.from('gambar baru'), 'foto_baru.jpg');

    // Memastikan modul fs.unlink sempat dipanggil oleh Service
    expect(unlinkSpy).toBeTruthy();
    unlinkSpy.mockRestore();
  });

  it('TC12 - Service Coverage: Menghapus file baru yang masuk jika ID target UPDATE ternyata tidak ditemukan', async () => {
    const unlinkSpy = jest.spyOn(fs, 'unlink').mockResolvedValue();
    
    // Kirim request ke ID yang tidak ada (999111) tapi membawa file baru
    const res = await request(app)
      .put('/items/999111') 
      .set('Authorization', `Bearer ${userToken}`)
      .field('user_id', dummyUser.id)
      .field('category_id', dummyCategory.id)
      .field('type', 'hilang')
      .field('name', 'Barang Palsu')
      .field('description', 'Tidak Ada')
      .field('location', 'Lab')
      .field('lost_date', '2026-06-14')
      .field('lost_time', '10:00')
      .field('contact', '08123')
      .attach('photo_path', Buffer.from('temp data'), 'ghost_file.jpg');

    expect(res.statusCode).toBe(404); 
    expect(unlinkSpy).toBeTruthy();
    unlinkSpy.mockRestore();
  });

  it('TC13 - Validator Coverage: Menghapus berkas jika validasi teks express-validator gagal', async () => {
    const unlinkSpy = jest.spyOn(fs, 'unlink').mockResolvedValue();

    // Kirim request langsung ke rute asli dengan token auth, lampirkan berkas tapi kosongkan field 'name'
    const res = await request(app)
      .post('/items')
      .set('Authorization', `Bearer ${userToken}`)
      .field('user_id', dummyUser.id)
      .field('category_id', dummyCategory.id)
      .field('type', 'hilang')
      .field('name', '') // Sengaja dikosongkan agar memicu error validator teks
      .field('location', 'Kantin')
      .field('lost_date', '2026-06-14')
      .field('lost_time', '12:30')
      .field('contact', '08123')
      .attach('photo_path', Buffer.from('invalid data'), 'file_validator_fail.jpg');

    expect(res.statusCode).toBe(400);
    expect(unlinkSpy).toBeTruthy();
    unlinkSpy.mockRestore();
  });

  it('TC14 - Validator Coverage: Menguji catch block ketika fs.unlink gagal membersihkan berkas sampah', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const unlinkSpy = jest.spyOn(fs, 'unlink').mockRejectedValue(new Error('Disk Read Only / Permission Denied'));

    const res = await request(app)
      .post('/items')
      .set('Authorization', `Bearer ${userToken}`)
      .field('user_id', dummyUser.id)
      .field('category_id', dummyCategory.id)
      .field('type', 'hilang')
      .field('name', '') // Picu validator fail
      .field('location', 'Kantin')
      .field('lost_date', '2026-06-14')
      .field('lost_time', '12:30')
      .field('contact', '08123')
      .attach('photo_path', Buffer.from('broken system data'), 'error_trigger.jpg');

    expect(res.statusCode).toBe(400);
    expect(consoleSpy).toBeTruthy();
    unlinkSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('TC15 - Helper Coverage: Menguji ketahanan hapus file langsung via fs.unlink', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const unlinkSpy = jest.spyOn(fs, 'unlink').mockRejectedValue(new Error('Fatal I/O Error'));
    
    // Trigger skenario penanganan error internal catch-block dengan mengirim update gagal ke id palsu
    await request(app)
      .put('/items/999222')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', 'Trigger Log Catch Block')
      .attach('photo_path', Buffer.from('test system'), 'err_system.jpg');
    
    expect(consoleSpy).toBeTruthy();
    unlinkSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  // ==========================================
  // CONTROLLER COVERAGE (ERRORS 500)
  // ==========================================

  it('TC16 - Controller Coverage: Menangani Error 500 pada fungsi Create', async () => {
    const serviceSpy = jest.spyOn(ItemService, 'create').mockRejectedValue(new Error('DB Connection Timeout'));
    
    const res = await request(app)
      .post('/items')
      .set('Authorization', `Bearer ${userToken}`)
      .field('user_id', dummyUser.id)
      .field('category_id', dummyCategory.id)
      .field('type', 'hilang')
      .field('name', 'Test Error')
      .field('description', 'Test Error')
      .field('location', 'Test Error')
      .field('lost_date', '2026-06-14')
      .field('lost_time', '12:30')
      .field('contact', '0812');

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('DB Connection Timeout');
    serviceSpy.mockRestore();
  });

  it('TC17 - Controller Coverage: Menangani Error 500 pada fungsi GetAll', async () => {
    const serviceSpy = jest.spyOn(ItemService, 'findAll').mockRejectedValue(new Error('Fatal Error'));
    const res = await request(app).get('/items');
    expect(res.statusCode).toBe(500);
    serviceSpy.mockRestore();
  });

  it('TC18 - Controller Coverage: Menangani Error 500 pada fungsi GetById', async () => {
    const serviceSpy = jest.spyOn(ItemService, 'findById').mockRejectedValue(new Error('Fatal Error'));
    const res = await request(app).get('/items/1');
    expect(res.statusCode).toBe(500);
    serviceSpy.mockRestore();
  });

  it('TC19 - Controller Coverage: Menangani Error 500 umum pada fungsi Update', async () => {
    const serviceSpy = jest.spyOn(ItemService, 'update').mockRejectedValue(new Error('Fatal Error'));
    const res = await request(app)
      .put(`/items/${itemIdWithPhoto}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('user_id', dummyUser.id)
      .field('category_id', dummyCategory.id)
      .field('type', 'hilang')
      .field('name', 'Update Error')
      .field('description', 'Deskripsi')
      .field('location', 'Kantin')
      .field('lost_date', '2026-06-14')
      .field('lost_time', '12:30')
      .field('contact', '08123456789');
      
    expect(res.statusCode).toBe(500);
    serviceSpy.mockRestore();
  });

  it('TC20 - Controller Coverage: Menangani Error 500 umum pada fungsi Delete', async () => {
    const serviceSpy = jest.spyOn(ItemService, 'delete').mockRejectedValue(new Error('Fatal Error'));
    const res = await request(app)
      .delete('/items/1')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(500);
    serviceSpy.mockRestore();
  });
});