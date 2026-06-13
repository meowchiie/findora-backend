// tests/services/lostItem.service.test.js

const LostItemService = require('../../src/services/lostItem.service');
const LostItem = require('../../src/models/LostItem');

jest.mock('../../src/models/LostItem', () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
}));

describe('LostItemService', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create()', () => {
        it('should create lost item successfully', async () => {
            const mockData = {
                name: 'Dompet'
            };
            
            LostItem.create.mockResolvedValue(mockData);
            const result = await LostItemService.create(mockData);

            expect(LostItem.create).toHaveBeenCalledWith(mockData);
            expect(result).toEqual(mockData);
        });
    });

    describe('findAll()', () => {
        it('should return all lost items', async () => {
            const mockItems = [
                { id: 1, name: 'Tas' }
            ];
            
            LostItem.findAll.mockResolvedValue(mockItems);
            const result = await LostItemService.findAll();

            expect(LostItem.findAll).toHaveBeenCalledWith({
                order: [["createdAt", "DESC"]],
            });

            expect(result).toEqual(mockItems);
        });

    });

    describe('findById()', () => {
        it('should return item by id', async () => {
            const mockItem = {
                id: 1,
                name: 'HP'
            };

            LostItem.findByPk.mockResolvedValue(mockItem);
            const result = await LostItemService.findById(1);

            expect(LostItem.findByPk).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockItem);
        });

    });

    describe('update()', () => {
        it('should update item successfully', async () => {
            const updateData = {
                name: 'Laptop Baru'
            };

            const updatedItem = {
                id: 1,
                name: 'Laptop Baru'
            };

            const mockItem = {
                update: jest.fn().mockResolvedValue(updatedItem)
            };

            LostItem.findByPk.mockResolvedValue(mockItem);
            const result = await LostItemService.update(1, updateData);

            expect(mockItem.update).toHaveBeenCalledWith(updateData);
            expect(result).toEqual(updatedItem);
        });

        it('should throw error if item not found', async () => {
            LostItem.findByPk.mockResolvedValue(null);

            await expect(
                LostItemService.update(99, {})
            ).rejects.toThrow('Lost item not found');
        });

    });

    describe('delete()', () => {
        it('should delete item successfully', async () => {
            const mockItem = {
                destroy: jest.fn().mockResolvedValue(true)
            };

            LostItem.findByPk.mockResolvedValue(mockItem);
            const result = await LostItemService.delete(1);

            expect(mockItem.destroy).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('should throw error if item not found', async () => {

            LostItem.findByPk.mockResolvedValue(null);

            await expect(
                LostItemService.delete(99)
            ).rejects.toThrow('Lost item not found');
        });

    });

});