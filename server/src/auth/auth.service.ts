import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

// Auth is intentionally "vanilla" for now: plain-text password storage, no
// hashing, no sessions/JWT. Every user created through this service — the
// abc/abc seed included — is a placeholder for exercising the sign
// up/sign in flow, not something real users should ever authenticate with.
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException('Username already taken');
    }

    const user = await this.prisma.user.create({
      data: { username: dto.username, password: dto.password },
    });

    return { id: user.id, username: user.username };
  }

  async signin(dto: SigninDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return { id: user.id, username: user.username };
  }
}
