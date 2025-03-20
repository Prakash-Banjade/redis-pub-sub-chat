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
   * accepts a message and the id of the receiver (socketId), then send the message to that specific user only
   * @params data {message: string, receiverId: string}
   */
  @SubscribeMessage('message:private:send')
  handlePrivateMessage(@MessageBody() data: { message: string, receiverId: string }, @ConnectedSocket() socket: Socket) {
    socket.to(data.receiverId).emit('message:private:receive', data);
  }

}
