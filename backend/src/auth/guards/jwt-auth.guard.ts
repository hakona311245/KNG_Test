import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_COOKIE } from '../auth.constants';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.[ACCESS_TOKEN_COOKIE];

    if (!token) {
      throw new UnauthorizedException('Authentication is required.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        status: payload.status,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.');
    }
  }
}
