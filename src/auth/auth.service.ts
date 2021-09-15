import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { jwtConstants } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(payload: any): Promise<any> {
    const user = await this.usersService.findOne(payload.username);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  async login(payload: any): Promise<any> {
    // find user
    const user = await this.usersService.findOne(payload.username);
    // here I should check the password, but we are just testing,
    // so free access to the users
    //if (user && user.password === pass) {
    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }
    // we have the user, create jwt token
    const { password, ...signPayload } = user;
    return {
      access_token: this.jwtService.sign(signPayload),
      expires_in: jwtConstants.expiration,
      ...signPayload,
    };
  }
}
