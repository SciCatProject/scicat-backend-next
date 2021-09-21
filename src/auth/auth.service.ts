import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { jwtConstants } from './constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findOne(username);

    if (!user) {
      return null;
    }

    // Hacky deep copy of User object, as shallow copy is not enough
    const { password, ...result } = JSON.parse(JSON.stringify(user));
    const match = await compare(pass, password);

    if (!match) {
      return null;
    }

    return result;
  }

  async login(user: Omit<User, 'password'>): Promise<any> {
    return {
      access_token: this.jwtService.sign(user),
      expires_in: jwtConstants.expiration,
      ...user,
    };
  }
}
