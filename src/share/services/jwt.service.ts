import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(private configService: ConfigService) {}

  sign(payload: any, expiresIn = '1 days'): string {
    const token = jwt.sign(payload, this.configService.get('SECRET_KEY'), {
      expiresIn,
    });
    return token;
  }

  verify(token: string): any {
    try {
      const decoded = jwt.verify(token, this.configService.get('SECRET_KEY'));
      return decoded;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, 403);
    }
  }
}
