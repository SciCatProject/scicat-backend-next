import { 
  Controller,
  Request,
  UseGuards,
  Post
} from '@nestjs/common';
import {
  LocalAuthGuard
} from './local-auth.guards';
import {
  AuthService
} from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
