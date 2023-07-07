import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtService } from './services/jwt.service';
import { ConfigModule } from '@nestjs/config';

const service = [JwtService];

@Global()
@Module({
  providers: [...service],
  exports: [...service],
  imports: [ConfigModule],
})

export class ShareModule {
  static forRoot(): DynamicModule {
    return {
      module: ShareModule,
      providers: service,
      exports: service,
    };
  }
}
