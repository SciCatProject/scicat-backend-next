import { 
  Controller,
  Request,
  Body,
  UseGuards,
  Post,
  Get
} from '@nestjs/common';
import {
  LocalAuthGuard
} from './guards/local-auth.guards';
import {
  AuthService
} from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService
  ) {}

  @Post('login')
  async login(@Body() payload: object): Promise<any> {
    return await this.authService.login(payload);
  }

  @Get('whoami')
  @UseGuards(JwtAuthGuard)
  async whoami(@Request() req: any): Promise<any> {
    const { password, ...user } = req.user;
    console.log(user);
    return user;
  }
}
