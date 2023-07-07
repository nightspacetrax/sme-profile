import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterResponseDto {
  @ApiProperty()
  @Expose({ name: 'uuid' })
  id: string;

  @ApiProperty()
  @Expose()
  user_name: string;
}
