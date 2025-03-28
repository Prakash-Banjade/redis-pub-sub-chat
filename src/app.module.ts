import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagesModule } from './messages/messages.module';
import { PubSubModule } from './pub-sub/pub-sub.module';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from './kafka/kafka.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: true,
      autoLoadEntities: true,
      entities: [`${__dirname}/**/**.entity{.ts,.js}`],
    }),
    MessagesModule,
    PubSubModule,
    KafkaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
