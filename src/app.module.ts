import { Module } from '@nestjs/common';
import { SocketGateway } from './app.gateway';

import { CoreModule } from './core/core.module';
import { ShareModule } from './share/share.module';
import { ModulesModule } from './modules/modules.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SmcService } from './modules/smc/smc.service';

const OrmModule = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get('DATABASE_HOST'),
    port: +configService.get<number>('DATABASE_PORT'),
    username: configService.get('DATABASE_USERNAME'),
    password: configService.get('DATABASE_PASSWORD'),
    database: configService.get('DATABASE_NAME'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
    logging:true
  }),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
    }),
    OrmModule,
    CoreModule.forRoot(),
    ShareModule.forRoot(),
    ModulesModule,
  ],
  providers: [SocketGateway, SmcService],
})
export class AppModule {}
