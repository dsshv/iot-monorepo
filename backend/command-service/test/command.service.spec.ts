import { Test, TestingModule } from '@nestjs/testing';
import { CommandService } from '../src/command/command.service';

jest.mock('../../../shared/nats', () => ({
  natsManager: {
    publish: jest.fn(),
  },
}));

const { natsManager } = require('../../../shared/nats');

describe('CommandService', () => {
  let service: CommandService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommandService],
    }).compile();
    service = module.get<CommandService>(CommandService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should publish command to NATS', async () => {
    await service.sendCommand('dev1', 'restart');
    expect(natsManager.publish).toHaveBeenCalledWith('device.command', { deviceId: 'dev1', command: 'restart' });
  });
}); 