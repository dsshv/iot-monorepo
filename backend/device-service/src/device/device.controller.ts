import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mongodb';
import { Device } from '../entities/device.entity';

@Controller('devices')
export class DeviceController {
  constructor(private readonly em: EntityManager) {}

  @Get()
  async findAll() {
    return this.em.find(Device, {});
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.em.findOne(Device, { _id: id });
  }

  @Post()
  async create(@Body() body: { name: string; type: string; status: string }) {
    const device = new Device();
    device.name = body.name;
    device.type = body.type;
    device.status = body.status;
    await this.em.persistAndFlush(device);
    return device;
  }

  @Put(':id')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    const device = await this.em.findOne(Device, { _id: id });
    if (!device) {
      throw new Error('Device not found');
    }
    
    device.status = body.status;
    await this.em.persistAndFlush(device);
    return device;
  }
}
