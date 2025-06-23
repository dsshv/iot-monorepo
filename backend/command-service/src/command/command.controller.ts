import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { CommandService } from './command.service';

@Controller('command')
export class CommandController {
  constructor(private readonly commandService: CommandService) {}

  @Post()
  async sendCommand(@Body() body: { deviceId?: string; command?: string }) {
    const { deviceId, command } = body;
    if (!deviceId || !command) {
      throw new BadRequestException('deviceId and command are required');
    }
    await this.commandService.sendCommand(deviceId, command);
    return { status: 'ok' };
  }
} 