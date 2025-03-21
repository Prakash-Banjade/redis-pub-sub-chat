import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PubSubService {
    private readonly publisher: Redis;
    private readonly subscriber: Redis;

    constructor(private configService: ConfigService) {
        // Get the Redis configuration options from the ConfigService
        const redisHost = this.configService.get<string>('REDIS_HOST') || 'localhost';
        const redisPort = this.configService.get<number>('REDIS_PORT') || 6379;

        // Connect to Redis with the configuration options
        this.publisher = new Redis({
            host: redisHost,
            port: redisPort,
        });
        this.subscriber = new Redis({
            host: redisHost,
            port: redisPort,
        });
    }

    publish(channel: string, message: string): void {
        this.publisher.publish(channel, message);
    }

    subscribe(channel: string, callback: (message: string) => void): void {
        this.subscriber.subscribe(channel);
        this.subscriber.on('message', (receivedChannel, receivedMessage) => { // listening for any messages via 'message' listener
            if (receivedChannel === channel) {
                callback(receivedMessage);
            }
        });
    }
}
