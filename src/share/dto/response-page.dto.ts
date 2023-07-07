import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";
import { PageMetaDto } from "./response-page-meta.dto";

export class PageDto<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly datas: Array<T>;

  @ApiProperty({ type: () => PageMetaDto })
  readonly meta: PageMetaDto;

  constructor(data: Array<T>, meta: PageMetaDto) {
    this.datas = data;
    this.meta = meta;
  }
}
