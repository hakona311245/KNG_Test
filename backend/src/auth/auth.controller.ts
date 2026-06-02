import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './types/authenticated-user.type';
import { REFRESH_TOKEN_COOKIE } from './auth.constants';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register customer account' })
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return {
      data: user,
      message: 'Customer registered successfully',
    };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.authService.login(dto, response);
    return {
      data,
      message: 'Logged in successfully',
    };
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh auth session' })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.authService.refresh(
      request.cookies?.[REFRESH_TOKEN_COOKIE],
      response,
    );
    return {
      data,
      message: 'Session refreshed successfully',
    };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout user' })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(
      request.cookies?.[REFRESH_TOKEN_COOKIE],
      response,
    );
    return {
      data: null,
      message: 'Logged out successfully',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get current user' })
  async me(@CurrentUser() currentUser: AuthenticatedUser) {
    const user = await this.authService.getCurrentUser(currentUser.id);
    return {
      data: user,
      message: 'Current user retrieved successfully',
    };
  }
}
