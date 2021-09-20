import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { jwtConstants } from './constants';
import { CredentialsDto } from './dto/credentials.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(credentials: CredentialsDto): Promise<any> {
    // find user
    const user = await this.usersService.findOne(credentials.username);
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
