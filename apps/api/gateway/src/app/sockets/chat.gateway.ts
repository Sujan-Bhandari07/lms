import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  onlineUsers = new Map<string, string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      client.disconnect();
      return;
    }

    this.onlineUsers.set(userId, client.id);

    console.log('Online users:', this.onlineUsers);

    this.server.emit(
      'users:online',
      Array.from(this.onlineUsers.keys()),
    );
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.onlineUsers) {
      if (socketId === client.id) {
        this.onlineUsers.delete(userId);
        break;
      }
    }

    this.server.emit(
      'users:online',
      Array.from(this.onlineUsers.keys()),
    );
  }

  
}