import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';

@Module({
    imports: [PubSubModule],
    providers: [MessagesGateway]
})
export class MessagesModule { }
