import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcrypt";
import { User } from "src/users/schemas/user.schema";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<User, "password"> | null> {
    const user = await this.usersService.findOne({ username }, true);

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

  async login(user: Omit<User, "password">): Promise<Record<string, unknown>> {
    const expiresIn = this.configService.get<number>("jwt.expiresIn");
    const accessToken = this.jwtService.sign(user, { expiresIn });
    return {
      access_token: accessToken,
      id: accessToken,
      expires_in: expiresIn,
      ttl: expiresIn,
      created: new Date().toISOString(),
      userId: user._id,
      user,
    };
  }
}
