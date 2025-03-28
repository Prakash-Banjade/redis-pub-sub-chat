import { UsePipes, ValidationPipe } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PubSubService } from 'src/pub-sub/pub-sub.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ProducerService } from 'src/kafka/producer.service';
import { REDIS_CHAT_CHANNEL } from 'src/CONSTANTS';

@WebSocketGateway()
export class MessagesGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private pubSubService: PubSubService,
    private readonly producerService: ProducerService
  ) {
    this.pubSubService.subscribe(REDIS_CHAT_CHANNEL, (message) => { // each instance of the server will subscribe to the 'chat' channel in the redis
      try {
        const data = JSON.parse(message);

        const roomId = data.roomId;
        const socketId = data.socketId;
        const senderSocket = this.server.sockets.sockets.get(socketId);

        if (!senderSocket && !roomId) {
          this.server.emit('message:receive', message); // Broadcast the message to all connected clients
        } else if (!senderSocket) {
          return this.server.to(roomId).emit('message:receive', message); // Broadcast the message to all connected clients in the room including sender
        } else {
          senderSocket.to(roomId).emit('message:receive', message); // Broadcast the message to all connected clients in the room except sender
        }

        this.producerService.produce({ topic: REDIS_CHAT_CHANNEL, messages: [{ value: JSON.stringify(data) }] }); // instead of saving directly to db, send the message to kafka because direct saving in db can cause delay and multiple messages write at once can crash the db

      } catch (e) { }
    });
  }

  afterInit(server: Server) {
    server.on('connection', (socket) => {
      server.emit('connected', `A new client connected: ${socket.id}`);
    });
  }

  /**
   * Not scalable approach
   */
  // @SubscribeMessage('message:send')
  // handleMessage(@MessageBody() data: any, @ConnectedSocket() socket: Socket) {
  //   socket.broadcast.emit('message:receive', data); // Broadcast the message to all connected clients except the sender, 
  //   // if we use this.server.emit(), this will broadcast the message to all connected clients including the sender
  // }

  /**
   * Scalable approach
   */
  @UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }))
  @SubscribeMessage('message:send')
  handleMessage(@MessageBody() data: CreateMessageDto, @ConnectedSocket() socket: Socket) {
    // Publish the message to the Redis channel
    this.pubSubService.publish(REDIS_CHAT_CHANNEL, JSON.stringify({ // publish the message to the 'chat' channel in the redis
      ...data,
      socketId: socket.id
    }));
  }

  /**
   * @description join a conversation
   * accepts the id of the conversation (can be any), this helps creating custom room, so the users can have private group chat instead of one-to-one private chat
   * by default each client is connected to the their socket.id room, joining another room makes them available in that room also
   */
  @SubscribeMessage('conversation:join')
  handleConversationJoin(@MessageBody() dto: CreateConversationDto, @ConnectedSocket() socket: Socket) {
    socket.join(dto.conversationId);
    console.log(`Socket ${socket.id} joined conversation ${dto.conversationId}`);
  }

}
