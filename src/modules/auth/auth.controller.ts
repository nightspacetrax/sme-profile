import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'src/share/dto/response-data.dto';
import { Status } from 'src/share/enum/resonse-status.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/auth.dto';
import { plainToClass } from 'class-transformer';
import { RegisterResponseDto } from './dto/register-response.dto';
import { AuthGuard } from 'src/core/guard/auth.guard';
import { User } from 'src/core/decorators/api-user.decorator';
import { RoleGuard } from 'src/core/guard/role.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const payload = await this.authService.login(body);
    return new ResponseDto<string>(Status.Success, payload);
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const user = await this.authService.register(body);
    return new ResponseDto<RegisterResponseDto>(
      Status.Success,
      plainToClass(RegisterResponseDto, user, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get('profile')
  @UseGuards(AuthGuard, RoleGuard)
  async findProfile(@User() user: any) {
    return new ResponseDto<any>(Status.Success, user);
  }
}
