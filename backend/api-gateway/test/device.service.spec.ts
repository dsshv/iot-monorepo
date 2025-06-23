import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { DeviceService } from '../src/device/device.service';

describe('DeviceService', () => {
  let service: DeviceService;
  let httpService: HttpService;

  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<DeviceService>(DeviceService);
    httpService = module.get<HttpService>(HttpService);
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

      mockHttpService.get.mockReturnValue(of({ data: mockDevices }));

      const result = await service.findAll();

      expect(mockHttpService.get).toHaveBeenCalledWith(`${process.env.DEVICE_SERVICE_URL}/devices`);
      expect(result).toEqual(mockDevices);
    });

    it('should handle HTTP errors', async () => {
      const error = new Error('HTTP Error');
      mockHttpService.get.mockImplementation(() => {
        throw error;
      });

      await expect(service.findAll()).rejects.toThrow('HTTP Error');
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

      mockHttpService.get.mockReturnValue(of({ data: mockDevice }));

      const result = await service.findOne(deviceId);

      expect(mockHttpService.get).toHaveBeenCalledWith(`${process.env.DEVICE_SERVICE_URL}/devices/${deviceId}`);
      expect(result).toEqual(mockDevice);
    });

    it('should handle device not found', async () => {
      const deviceId = 'nonexistent';
      mockHttpService.get.mockReturnValue(of({ data: null }));

      const result = await service.findOne(deviceId);

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

      const mockDevice = {
        _id: 'new-device-id',
        ...createData,
      };

      mockHttpService.post.mockReturnValue(of({ data: mockDevice }));

      const result = await service.create(createData);

      expect(mockHttpService.post).toHaveBeenCalledWith(`${process.env.DEVICE_SERVICE_URL}/devices`, createData);
      expect(result).toEqual(mockDevice);
    });
  });

  describe('updateStatus', () => {
    it('should update device status', async () => {
      const deviceId = 'device123';
      const updateData = { status: 'inactive' };

      const mockDevice = {
        _id: deviceId,
        name: 'Test Sensor',
        type: 'Temperature',
        status: 'inactive',
      };

      mockHttpService.put.mockReturnValue(of({ data: mockDevice }));

      const result = await service.updateStatus(deviceId, updateData);

      expect(mockHttpService.put).toHaveBeenCalledWith(`${process.env.DEVICE_SERVICE_URL}/devices/${deviceId}`, updateData);
      expect(result).toEqual(mockDevice);
    });
  });
}); 