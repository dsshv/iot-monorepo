import { Resolver, Query, Args, UseGuards } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/auth.guard';
import { DeviceService, Device } from './device.service';

@Resolver('Device')
@UseGuards(JwtAuthGuard)
export class DeviceResolver {
  constructor(private readonly deviceService: DeviceService) {}

  @Query()
  async devices(@CurrentUser() user: any): Promise<Device[]> {
    return this.deviceService.getAllDevices();
  }

  @Query()
  async device(@Args('id') id: string, @CurrentUser() user: any): Promise<Device> {
    return this.deviceService.getDeviceById(id);
  }
} 