import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/mongodb';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly em: EntityManager, private readonly jwtService: JwtService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    const hash = await bcrypt.hash(body.password, 10);
    const user = new User();
    user.email = body.email;
    user.passwordHash = hash;
    await this.em.persistAndFlush(user);
    return { message: 'User registered' };
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.em.findOne(User, { email: body.email });
    if (!user) throw new UnauthorizedException();
    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException();
    const token = this.jwtService.sign({ sub: user._id });
    return { token };
  }
}
