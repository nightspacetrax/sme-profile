import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { ReqWithUserDto } from 'src/share/dto/request-with-user.dto';
import { JwtService } from 'src/share/services/jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: ReqWithUserDto = context.switchToHttp().getRequest();
    const key = request.headers['authorization'] as string;
    if (!key) throw new HttpException(`Unauthorized header`, 401);
    try {
      const token = key.replace('Bearer ', '');
      if (!token) {
        throw new HttpException(`Unauthorized token`, 401);
      }
      const profile = await this.jwtService.verify(token);
      request.user = profile;
      return true;
    } catch (error) {
      throw new HttpException(error.message, 403);
    }
  }
}
