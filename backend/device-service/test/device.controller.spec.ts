import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/mongodb';
import { DeviceController } from '../src/device/device.controller';
import { Device } from '../src/entities/device.entity';

describe('DeviceController', () => {
  let controller: DeviceController;
  let entityManager: EntityManager;

  const mockEntityManager = {
    find: jest.fn(),
    findOne: jest.fn(),
    persistAndFlush: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceController],
      providers: [
        { provide: EntityManager, useValue: mockEntityManager },
      ],
    }).compile();

    controller = module.get<DeviceController>(DeviceController);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all devices', async () => {
      const mockDevices = [
        { _id: '1', name: 'Sensor 1', type: 'Temperature', status: 'active' },
        { _id: '2', name: 'Sensor 2', type: 'Humidity', status: 'inactive' },
      ];

      mockEntityManager.find.mockResolvedValue(mockDevices);

      const result = await controller.findAll();

      expect(mockEntityManager.find).toHaveBeenCalledWith(Device, {});
      expect(result).toEqual(mockDevices);
    });

    it('should return empty array when no devices exist', async () => {
      mockEntityManager.find.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a device by id', async () => {
      const deviceId = 'device123';
      const mockDevice = {
        _id: deviceId,
        name: 'Test Sensor',
        type: 'Temperature',
        status: 'active',
      };

      mockEntityManager.findOne.mockResolvedValue(mockDevice);

      const result = await controller.findOne(deviceId);

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Device, { _id: deviceId });
      expect(result).toEqual(mockDevice);
    });

    it('should return null when device not found', async () => {
      const deviceId = 'nonexistent';

      mockEntityManager.findOne.mockResolvedValue(null);

      const result = await controller.findOne(deviceId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new device', async () => {
      const createData = {
        name: 'New Sensor',
        type: 'Pressure',
        status: 'active',
      };

      const mockDevice = new Device();
      mockDevice.name = createData.name;
      mockDevice.type = createData.type;
      mockDevice.status = createData.status;
      mockDevice._id = 'new-device-id';

      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);

      const result = await controller.create(createData);

      expect(mockEntityManager.persistAndFlush).toHaveBeenCalled();
      expect(result.name).toBe(createData.name);
      expect(result.type).toBe(createData.type);
      expect(result.status).toBe(createData.status);
    });
  });

  describe('updateStatus', () => {
    it('should update device status successfully', async () => {
      const deviceId = 'device123';
      const updateData = { status: 'inactive' };

      const mockDevice = new Device();
      mockDevice._id = deviceId;
      mockDevice.name = 'Test Sensor';
      mockDevice.type = 'Temperature';
      mockDevice.status = 'active';

      mockEntityManager.findOne.mockResolvedValue(mockDevice);
      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);

      const result = await controller.updateStatus(deviceId, updateData);

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Device, { _id: deviceId });
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalled();
      expect(result.status).toBe(updateData.status);
    });

    it('should throw error when device not found', async () => {
      const deviceId = 'nonexistent';
      const updateData = { status: 'inactive' };

      mockEntityManager.findOne.mockResolvedValue(null);

      await expect(controller.updateStatus(deviceId, updateData)).rejects.toThrow('Device not found');
    });
  });
}); 