import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PubSubService } from 'src/pub-sub/pub-sub.service';

@WebSocketGateway()
export class MessagesGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly REDIS_CHAT_CHANNEL = 'chat';

  constructor(private pubSubService: PubSubService) {
    this.pubSubService.subscribe(this.REDIS_CHAT_CHANNEL, (message) => { // each instance of the server will subscribe to the 'chat' channel in the redis
      try {
        const roomId = JSON.parse(message).roomId;
        const socketId = JSON.parse(message).socketId;
        const senderSocket = this.server.sockets.sockets.get(socketId);

        if (!roomId) {
          return this.server.emit('message:receive', message); // Broadcast the message to all connected clients
        }

        if (!senderSocket) {
          return this.server.to(roomId).emit('message:receive', message); // Broadcast the message to all connected clients in the room including sender
        }

        senderSocket.to(roomId).emit('message:receive', message); // Broadcast the message to all connected clients in the room except sender
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
  @SubscribeMessage('message:send')
  handleMessage(@MessageBody() data: any, @ConnectedSocket() socket: Socket) {
    // Publish the message to the Redis channel
    this.pubSubService.publish(this.REDIS_CHAT_CHANNEL, JSON.stringify({ // publish the message to the 'chat' channel in the redis
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
  handleConversationJoin(@MessageBody() data: string, @ConnectedSocket() socket: Socket) {
    socket.join(data);
  }

}
