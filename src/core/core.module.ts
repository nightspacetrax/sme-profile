import { DynamicModule, Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HandleException } from './error/handle-error';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HandleException,
    },
    TransformInterceptor,
  ],
  imports: [ConfigModule],
})
export class CoreModule {
  static forRoot(): DynamicModule {
    return {
      module: CoreModule,
    };
  }
}
