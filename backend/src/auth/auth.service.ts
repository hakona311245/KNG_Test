import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toPublicUser } from '../users/user.presenter';
import { UsersService } from '../users/users.service';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_TYPE,
  SALT_ROUNDS,
} from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type RefreshPayload = {
  sub: string;
  sessionId: string;
  type: typeof REFRESH_TOKEN_TYPE;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.usersService.createCustomer({
      email: dto.email,
      fullName: dto.fullName,
      passwordHash,
      phoneNumber: dto.phoneNumber,
    });

    return toPublicUser(user);
  }

  async login(dto: LoginDto, response: Response) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active.');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    await this.issueAuthCookies(user, response);

    return { user: toPublicUser(user) };
  }

  async refresh(refreshToken: string | undefined, response: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required.');
    }

    let payload: RefreshPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    if (payload.type !== REFRESH_TOKEN_TYPE) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const session = await this.prisma.refreshSession.findUnique({
      where: { id: payload.sessionId },
      include: { user: true },
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Refresh session is invalid.');
    }

    const tokenMatches = await bcrypt.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!tokenMatches) {
      await this.prisma.refreshSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh session is invalid.');
    }

    if (session.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active.');
    }

    await this.prisma.refreshSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    await this.issueAuthCookies(session.user, response);

    return { user: toPublicUser(session.user) };
  }

  async logout(refreshToken: string | undefined, response: Response) {
    if (refreshToken) {
      try {
        const payload = await this.jwtService.verifyAsync<RefreshPayload>(
          refreshToken,
          { secret: process.env.JWT_REFRESH_SECRET },
        );

        await this.prisma.refreshSession.updateMany({
          where: {
            id: payload.sessionId,
            revokedAt: null,
          },
          data: { revokedAt: new Date() },
        });
      } catch {
        // Logout should still clear cookies when the session is already invalid.
      }
    }

    this.clearAuthCookies(response);
  }

  async getCurrentUser(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User not found.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active.');
    }

    return toPublicUser(user);
  }

  private async issueAuthCookies(user: User, response: Response) {
    const session = await this.prisma.refreshSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: '',
        expiresAt: this.getRefreshExpiresAt(),
      },
    });

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as never,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        sessionId: session.id,
        type: REFRESH_TOKEN_TYPE,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as never,
      },
    );

    await this.prisma.refreshSession.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: await bcrypt.hash(refreshToken, SALT_ROUNDS),
      },
    });

    response.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...this.getBaseCookieOptions(),
      path: '/',
    });
    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...this.getBaseCookieOptions(),
      path: '/api/auth',
    });
  }

  private clearAuthCookies(response: Response) {
    response.clearCookie(ACCESS_TOKEN_COOKIE, {
      ...this.getBaseCookieOptions(),
      path: '/',
    });
    response.clearCookie(REFRESH_TOKEN_COOKIE, {
      ...this.getBaseCookieOptions(),
      path: '/api/auth',
    });
  }

  private getBaseCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: (process.env.COOKIE_SAME_SITE ?? 'lax') as
        | 'lax'
        | 'strict'
        | 'none',
    };
  }

  private getRefreshExpiresAt() {
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';
    const match = /^(\d+)([dhm])$/.exec(expiresIn);

    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const amount = Number(match[1]);
    const unit = match[2];
    const unitMs = {
      d: 24 * 60 * 60 * 1000,
      h: 60 * 60 * 1000,
      m: 60 * 1000,
    }[unit];

    if (!unitMs) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    return new Date(Date.now() + amount * unitMs);
  }
}
