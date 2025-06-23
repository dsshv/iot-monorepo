import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface Device {
  _id: string;
  name: string;
  type: string;
  status: string;
}

export interface CreateDeviceDto {
  name: string;
  type: string;
  status: string;
}

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);
  private readonly deviceServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.deviceServiceUrl = this.configService.get<string>('DEVICE_SERVICE_URL') || 'http://device-service:3002';
  }

  async findAll(): Promise<Device[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<Device[]>(`${this.deviceServiceUrl}/devices`)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch devices: ${error.message}`);
      throw new Error('Failed to fetch devices from device service');
    }
  }

  async findOne(id: string): Promise<Device> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<Device>(`${this.deviceServiceUrl}/devices/${id}`)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch device ${id}: ${error.message}`);
      throw new Error(`Device with id ${id} not found`);
    }
  }

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<Device>(`${this.deviceServiceUrl}/devices`, createDeviceDto)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create device: ${error.message}`);
      throw new Error('Failed to create device');
    }
  }

  async updateStatus(id: string, status: string): Promise<Device> {
    try {
      const response = await firstValueFrom(
        this.httpService.put<Device>(`${this.deviceServiceUrl}/devices/${id}`, { status })
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update device ${id} status: ${error.message}`);
      throw new Error(`Failed to update device status`);
    }
  }

  // Backward compatibility methods
  async getAllDevices(): Promise<Device[]> {
    return this.findAll();
  }

  async getDeviceById(id: string): Promise<Device> {
    return this.findOne(id);
  }
} 