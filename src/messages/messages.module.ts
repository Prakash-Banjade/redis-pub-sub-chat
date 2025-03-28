import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';
import { KafkaModule } from 'src/kafka/kafka.module';
import { MessagesConsumer } from './messages.consumer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Message
        ]),
        PubSubModule,
        KafkaModule
    ],
    providers: [
        MessagesGateway,
        MessagesConsumer,
    ]
})
export class MessagesModule { }
