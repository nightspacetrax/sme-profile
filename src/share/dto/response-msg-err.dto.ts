import { ApiProperty } from '@nestjs/swagger';

export default class ResponseMsgError {
  @ApiProperty({ required: false })
  status_code?: number | null;
  @ApiProperty({ required: false })
  type: string;
  @ApiProperty({ required: false })
  description?: any;

  @ApiProperty({ required: false })
  transaction_id: string;

  constructor(code: number, type: string, description: any) {
    this.status_code = code;
    this.type = type;
    this.description = description;
  }
}
