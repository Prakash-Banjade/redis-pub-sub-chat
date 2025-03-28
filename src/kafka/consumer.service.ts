import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Consumer, ConsumerRunConfig, ConsumerSubscribeTopics, Kafka } from "kafkajs";

@Injectable()
export class ConsumerService implements OnModuleDestroy {
    private readonly kafka = new Kafka({
        brokers: ['localhost:9092'],
    });

    private readonly consumers: Consumer[] = [];

    async consume(topics: ConsumerSubscribeTopics) {
        const consumer = this.kafka.consumer({
            groupId: 'test-group',
        });

        await consumer.connect();
        await consumer.subscribe(topics);

        this.consumers.push(consumer);

        return consumer;
    }

    async onModuleDestroy() {
        for (const consumer of this.consumers) {
            consumer.disconnect();
        }
    }
}