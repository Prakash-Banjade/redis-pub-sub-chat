import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagesModule } from './messages/messages.module';
import { PubSubModule } from './pub-sub/pub-sub.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MessagesModule,
    PubSubModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
