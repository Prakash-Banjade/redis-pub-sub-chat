import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class MessagesGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    server.on('connection', (socket) => {
      server.emit('connected', `A new client connected: ${socket.id}`);
    });
  }

  @SubscribeMessage('message:send')
  handleMessage(@MessageBody() data: string, @ConnectedSocket() socket: Socket) {
    socket.broadcast.emit('message:receive', data); // Broadcast the message to all connected clients except the sender, 
    // if we use this.server.emit(), this will broadcast the message to all connected clients including the sender
  }

  /**
   * @description send a private message
   * accepts a message and the id of the room (specific socketId or custom roomId), then send the message to that specific user only
   * @params data {message: string, roomId: string}
   */
  @SubscribeMessage('message:private:send')
  handlePrivateMessage(@MessageBody() data: { message: string, roomId: string }, @ConnectedSocket() socket: Socket) {
    socket.to(data.roomId).emit('message:private:receive', data);
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
