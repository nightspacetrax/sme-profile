import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
