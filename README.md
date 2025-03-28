# Scalable Socket Server

## Description

Web socker connection is stateful and maintains a tightly coupled connection. When server is scaled up, some clients are connected to previous server and other might get connected to newly instantiated server replica. When client from cross server tries to communicate, it will fail. 

## Solution

Use Redis Publisher Subscriber to publish messages from any server to the redis. All instances of server will subscribe to the redis channel and broadcast the message to required connected clients.

Also use Kafka to handle high throughput of messages, meaning instead of instantly saving to db synchronously, save the message to kafka and process it later.