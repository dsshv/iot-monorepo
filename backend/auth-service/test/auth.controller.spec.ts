import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/mongodb';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthController } from '../src/auth/auth.controller';
import { User } from '../src/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let jwtService: JwtService;
  let entityManager: EntityManager;

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockEntityManager = {
    persistAndFlush: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: JwtService, useValue: mockJwtService },
        { provide: EntityManager, useValue: mockEntityManager },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jwtService = module.get<JwtService>(JwtService);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = new User();
      mockUser.email = registerData.email;
      mockUser.passwordHash = 'hashedPassword';

      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);

      const result = await controller.register(registerData);

      expect(mockEntityManager.persistAndFlush).toHaveBeenCalled();
      expect(result).toEqual({ message: 'User registered' });
    });

    it('should hash password before saving', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const bcryptSpy = jest.spyOn(bcrypt, 'hash');
      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);

      await controller.register(registerData);

      expect(bcryptSpy).toHaveBeenCalledWith(registerData.password, 10);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = new User();
      mockUser._id = 'user123';
      mockUser.email = loginData.email;
      mockUser.passwordHash = await bcrypt.hash(loginData.password, 10);

      mockEntityManager.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await controller.login(loginData);

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(User, { email: loginData.email });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: mockUser._id });
      expect(result).toEqual({ token: 'jwt-token' });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockEntityManager.findOne.mockResolvedValue(null);

      await expect(controller.login(loginData)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = new User();
      mockUser._id = 'user123';
      mockUser.email = loginData.email;
      mockUser.passwordHash = await bcrypt.hash('correctpassword', 10);

      mockEntityManager.findOne.mockResolvedValue(mockUser);

      await expect(controller.login(loginData)).rejects.toThrow(UnauthorizedException);
    });
  });
}); 