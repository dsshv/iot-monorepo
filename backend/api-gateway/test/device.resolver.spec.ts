import { Test, TestingModule } from '@nestjs/testing';
import { DeviceResolver } from '../src/device/device.resolver';
import { DeviceService } from '../src/device/device.service';

describe('DeviceResolver', () => {
  let resolver: DeviceResolver;
  let deviceService: DeviceService;

  const mockDeviceService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceResolver,
        { provide: DeviceService, useValue: mockDeviceService },
      ],
    }).compile();

    resolver = module.get<DeviceResolver>(DeviceResolver);
    deviceService = module.get<DeviceService>(DeviceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('devices', () => {
    it('should return all devices', async () => {
      const mockDevices = [
        { _id: '1', name: 'Sensor 1', type: 'Temperature', status: 'active' },
        { _id: '2', name: 'Sensor 2', type: 'Humidity', status: 'inactive' },
      ];

      mockDeviceService.findAll.mockResolvedValue(mockDevices);

      const result = await resolver.devices();

      expect(mockDeviceService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockDevices);
    });

    it('should handle empty devices list', async () => {
      mockDeviceService.findAll.mockResolvedValue([]);

      const result = await resolver.devices();

      expect(result).toEqual([]);
    });
  });

  describe('device', () => {
    it('should return a device by id', async () => {
      const deviceId = 'device123';
      const mockDevice = {
        _id: deviceId,
        name: 'Test Sensor',
        type: 'Temperature',
        status: 'active',
      };

      mockDeviceService.findOne.mockResolvedValue(mockDevice);

      const result = await resolver.device(deviceId);

      expect(mockDeviceService.findOne).toHaveBeenCalledWith(deviceId);
      expect(result).toEqual(mockDevice);
    });

    it('should return null when device not found', async () => {
      const deviceId = 'nonexistent';
      mockDeviceService.findOne.mockResolvedValue(null);

      const result = await resolver.device(deviceId);

      expect(result).toBeNull();
    });
  });

  describe('createDevice', () => {
    it('should create a new device', async () => {
      const createData = {
        name: 'New Sensor',
        type: 'Pressure',
        status: 'active',
      };

      const mockDevice = {
        _id: 'new-device-id',
        ...createData,
      };

      mockDeviceService.create.mockResolvedValue(mockDevice);

      const result = await resolver.createDevice(createData);

      expect(mockDeviceService.create).toHaveBeenCalledWith(createData);
      expect(result).toEqual(mockDevice);
    });
  });

  describe('updateDeviceStatus', () => {
    it('should update device status', async () => {
      const deviceId = 'device123';
      const updateData = { status: 'inactive' };

      const mockDevice = {
        _id: deviceId,
        name: 'Test Sensor',
        type: 'Temperature',
        status: 'inactive',
      };

      mockDeviceService.updateStatus.mockResolvedValue(mockDevice);

      const result = await resolver.updateDeviceStatus(deviceId, updateData);

      expect(mockDeviceService.updateStatus).toHaveBeenCalledWith(deviceId, updateData);
      expect(result).toEqual(mockDevice);
    });
  });
}); 