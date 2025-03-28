import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Kafka, ProducerRecord } from 'kafkajs'

@Injectable()
export class ProducerService implements OnModuleInit, OnModuleDestroy {
    private readonly kafka = new Kafka({
        brokers: ['localhost:9092'],
    });
    private readonly producer = this.kafka.producer();

    onModuleInit() {
        this.producer.connect();
    }

    onModuleDestroy() {
        this.producer.disconnect();
    }

    async produce(record: ProducerRecord) {
        await this.producer.send(record);
    }
}