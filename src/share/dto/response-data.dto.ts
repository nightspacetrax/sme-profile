import { ApiProperty } from '@nestjs/swagger';
import { Status, StatusData } from '../enum/resonse-status.enum';

export class ResponseDto<T> {
  @ApiProperty()
  transaction_id: string;
  @ApiProperty()
  message: string;
  @ApiProperty()
  status_code: number;
  @ApiProperty()
  payload: T;

  constructor(statusCode: Status, data: T) {
    const status = StatusData[statusCode];
    this.status_code = status.code;
    this.message = status.description;
    this.payload = data;
  }
}
