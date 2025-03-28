import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { REDIS_CHAT_CHANNEL } from "src/CONSTANTS";
import { ConsumerService } from "src/kafka/consumer.service";
import { Message } from "./entities/message.entity";
import { Repository } from "typeorm";

@Injectable()
export class MessagesConsumer implements OnModuleInit {
    constructor(
        private readonly consumerService: ConsumerService,
        @InjectRepository(Message) private readonly messageRepository: Repository<Message>
    ) { }

    async onModuleInit() {
        const consumer = await this.consumerService.consume(
            {
                topics: [REDIS_CHAT_CHANNEL],
            },
        );

        consumer.run({
            eachMessage: async ({ message, pause }) => {
                try {
                    const messageString = message.value?.toString();

                    if (!messageString) return;

                    const messageObj = JSON.parse(messageString);

                    const newMessage = this.messageRepository.create({
                        text: messageObj.message,
                        conversationId: messageObj.roomId,
                    });

                    await this.messageRepository.save(newMessage);
                } catch (e) { // if any error happens due to reasons like db write limit exceeds, we pause the consumer and try again later 
                    console.log(e);
                    pause();

                    setTimeout(() => { // try again after 1 minute
                        consumer.resume([{ topic: REDIS_CHAT_CHANNEL }]);
                    }, 60 * 1000);
                }
            }
        });
    }
}