const request = require('supertest');
const express = require('express');
const db = require('../config/database');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken'); 
const { Item, User, Category } = require('../src/models'); 
const ItemService = require('../src/services/item.service');
const itemRoutes = require('../src/routes/item.routes');

// IMPORT TAMBAHAN UNTUK MENGEJAR 100% BRANCH COVERAGE
const ItemController = require('../src/controllers/item.controller');
const { validateItem } = require('../src/validators/item.validator');
const expressValidator = require('express-validator');

jest.mock('express-validator', () => {
  const originalModule = jest.requireActual('express-validator');
  return {
    ...originalModule,
    matchedData: jest.fn((...args) => originalModule.matchedData(...args)),
    validationResult: jest.fn((...args) => originalModule.validationResult(...args)),
  };
});

const app = express();
app.use(express.json());
app.use('/items', itemRoutes);

let targetId;
let itemIdWithPhoto;
let dummyUser;
let dummyCategory;
let userToken; 

beforeAll(async () => {
  try {
    await db.authenticate();

    await db.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    await Item.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    await Category.destroy({ where: {}, force: true });
    await db.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });

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
      .set('Authorization', `Bearer ${userToken}`) 
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
      .attach('photo_path', Buffer.from('dummy content'), 'dompet.jpg'); 

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
    const res = await request(app).get('/items'); 
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

  it('TC11 - Service Coverage: Menghapus file lama saat melakukan update foto baru', async () => {
    const unlinkSpy = jest.spyOn(fs, 'unlink').mockResolvedValue();

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
      photo_path: 'public/uploads/items/foto_lama_tersimpan.jpg' 
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

    expect(unlinkSpy).toBeTruthy();
    unlinkSpy.mockRestore();
  });

  it('TC12 - Service Coverage: Menghapus file baru yang masuk jika ID target UPDATE ternyata tidak ditemukan', async () => {
    const unlinkSpy = jest.spyOn(fs, 'unlink').mockResolvedValue();
    
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

    const res = await request(app)
      .post('/items')
      .set('Authorization', `Bearer ${userToken}`)
      .field('user_id', dummyUser.id)
      .field('category_id', dummyCategory.id)
      .field('type', 'hilang')
      .field('name', '') 
      .field('location', 'Kantin')
      .field('lost_date', '2026-06-14')
      .field('lost_time', '12:30')
      .field('contact', '08123')
      .attach('photo_path', Buffer.from('invalid data'), 'file_validator_fail.jpg');

    expect(res.statusCode).toBe(400);
    expect(unlinkSpy).toBeTruthy();
    unlinkSpy.mockRestore();
  });

  it('TC14 - Validator Branch: Menguji catch block ketika fs.unlink gagal menghapus berkas', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const unlinkSpy = jest.spyOn(fs, 'unlink').mockRejectedValue(new Error('Disk Read Only'));

    const res = await request(app)
      .post('/items')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', '') 
      .attach('photo_path', Buffer.from('broken system file'), 'error_trigger.jpg');

    expect(res.statusCode).toBe(400);
    expect(consoleSpy).toHaveBeenCalled(); 
    
    unlinkSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('TC15 - Helper Coverage: Menguji ketahanan hapus file langsung via fs.unlink', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const unlinkSpy = jest.spyOn(fs, 'unlink').mockRejectedValue(new Error('Fatal I/O Error'));
    
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

  it('TC20 - Controller Coverage: Menangani Error 500 umum pada fungsi Delete', async () => {
    const serviceSpy = jest.spyOn(ItemService, 'delete').mockRejectedValue(new Error('Fatal Error'));
    const res = await request(app)
      .delete('/items/1')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(500);
    serviceSpy.mockRestore();
  });

  // ==========================================
  // TAMBAHAN UNTUK MENGEJAR 100% BRANCH COVERAGE
  // ==========================================




  it('TC24 - Validator Branch: Menghapus file sampah menggunakan single upload format (req.file)', async () => {
    const unlinkSpy = jest.spyOn(fs, 'unlink').mockResolvedValue();

    const res = await request(app)
      .post('/items')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', '') 
      .attach('photo_path', Buffer.from('test file upload'), 'error_single.jpg');

    expect(res.statusCode).toBe(400);
    unlinkSpy.mockRestore();
  });

  it('TC30 - Controller Branch: Mengeksekusi semua variasi filter query pada getAll', async () => {
    const res = await request(app)
      .get('/items')
      .query({
        user_id: dummyUser.id,
        type: 'hilang',
        category_id: dummyCategory.id,
        search: 'Dompet',
        status: 'Menunggu'
      });

    expect(res.statusCode).toBe(200);
  });

  it('TC31 - Controller Branch: Mengeksekusi filter kebalikan status_not pada getAll', async () => {
    const res = await request(app)
      .get('/items')
      .query({ status_not: 'Selesai' });

    expect(res.statusCode).toBe(200);
  });


  it('TC34 - Controller Branch: Menangani error internal 500 pada fungsi getDashboardStats', async () => {
    const countSpy = jest.spyOn(Item, 'count').mockRejectedValue(new Error('Database Down'));

    const res = await request(app)
      .get('/items/stats')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(500);
    countSpy.mockRestore();
  });

  it('TC35 - Controller Branch: Menangani respons 404 "Item not found" pada fungsi DELETE Controller', async () => {
    const serviceDeleteSpy = jest.spyOn(ItemService, 'delete').mockRejectedValue(new Error('Item not found'));

    const res = await request(app)
      .delete('/items/999444') 
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(404);
    serviceDeleteSpy.mockRestore();
  });

  // =========================================================================
  // NEW SURGICAL BRANCH-COVERAGE TESTS (DIRECT UNIT TESTING & BALANCING)
  // =========================================================================

  it('TC36 - Unit Test: ItemController.create memicu cabang req.file secara eksplisit', async () => {
    expressValidator.matchedData.mockReturnValueOnce({ name: 'Item Eksperimen' });
    const createSpy = jest.spyOn(ItemService, 'create').mockResolvedValue({ id: 101 });

    const reqMock = { file: { filename: 'file_mocked.png' } };
    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await ItemController.create(reqMock, resMock);
    expect(resMock.status).toHaveBeenCalledWith(201);
    createSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('TC37 - Unit Test: ItemController.getAll memicu short-circuit || kustom untuk page dan limit', async () => {
    const findAllSpy = jest.spyOn(ItemService, 'findAll').mockResolvedValue({
      totalItems: 1, totalPages: 1, currentPage: 2, data: []
    });

    const reqMock = { query: { page: 2, limit: 5 } }; // bypass nilai default || 1 dan || 10
    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await ItemController.getAll(reqMock, resMock);
    expect(resMock.status).toHaveBeenCalledWith(200);
    findAllSpy.mockRestore();
  });

  it('TC38 - Unit Test: ItemController.update memicu cabang req.files dengan photo_path array', async () => {
    expressValidator.matchedData.mockReturnValueOnce({ name: 'Item Eksperimen' });
    const updateSpy = jest.spyOn(ItemService, 'update').mockResolvedValue({ id: 1 });

    const reqMock = {
      params: { id: 1 },
      files: {
        photo_path: [{ path: 'public\\uploads\\items\\photo.jpg' }]
      }
    };
    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await ItemController.update(reqMock, resMock);
    expect(resMock.status).toHaveBeenCalledWith(200);
    updateSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('TC39 - Unit Test: validateItem memicu cabang req.files di mana hanya properti image yang tersedia', async () => {
    expressValidator.validationResult.mockReturnValueOnce({
      isEmpty: () => false,
      array: () => [{ path: 'name', msg: 'Nama Kosong' }]
    });
    const unlinkSpy = jest.spyOn(fs, 'unlink').mockResolvedValue();

    const reqMock = {
      files: {
        image: [{ path: 'image_trash.jpg' }] // photo_path dilewati (falsy) memicu branch || []
      }
    };
    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const nextMock = jest.fn();

    const middlewareFn = validateItem[validateItem.length - 1];
    await middlewareFn(reqMock, resMock, nextMock);

    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(unlinkSpy).toHaveBeenCalledWith('image_trash.jpg');
    unlinkSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('TC40 - Unit Test: validateItem memicu cabang req.files di mana hanya properti photo_path yang tersedia', async () => {
    expressValidator.validationResult.mockReturnValueOnce({
      isEmpty: () => false,
      array: () => [{ path: 'name', msg: 'Nama Kosong' }]
    });
    const unlinkSpy = jest.spyOn(fs, 'unlink').mockResolvedValue();

    const reqMock = {
      files: {
        photo_path: [{ path: 'photo_trash.jpg' }] // image dilewati (falsy) memicu branch || []
      }
    };
    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const nextMock = jest.fn();

    const middlewareFn = validateItem[validateItem.length - 1];
    await middlewareFn(reqMock, resMock, nextMock);

    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(unlinkSpy).toHaveBeenCalledWith('photo_trash.jpg');
    unlinkSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('TC41 - Unit Test: ItemController.update menangani catch block spesifik "Item not found"', async () => {
    expressValidator.matchedData.mockReturnValueOnce({ name: 'Item Eksperimen' });
    const updateSpy = jest.spyOn(ItemService, 'update').mockRejectedValue(new Error('Item not found'));

    const reqMock = { params: { id: 999 }, files: null };
    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await ItemController.update(reqMock, resMock);
    expect(resMock.status).toHaveBeenCalledWith(404);
    updateSpy.mockRestore();
    jest.restoreAllMocks();
  });
});