import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockJwtService = {
    verify: jest.fn(),
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      const token = 'valid-jwt-token';
      const payload = { sub: 'user123', email: 'test@example.com' };

      mockJwtService.verify.mockReturnValue(payload);

      const result = await service.validateToken(token);

      expect(mockJwtService.verify).toHaveBeenCalledWith(token, { secret: process.env.JWT_SECRET });
      expect(result).toEqual(payload);
    });

    it('should throw error for invalid token', async () => {
      const token = 'invalid-jwt-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateToken(token)).rejects.toThrow('Invalid token');
    });
  });

  describe('generateToken', () => {
    it('should generate token successfully', () => {
      const payload = { sub: 'user123', email: 'test@example.com' };
      const expectedToken = 'generated-jwt-token';

      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = service.generateToken(payload);

      expect(mockJwtService.sign).toHaveBeenCalledWith(payload, { secret: process.env.JWT_SECRET });
      expect(result).toBe(expectedToken);
    });
  });
}); 