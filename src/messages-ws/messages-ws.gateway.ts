import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { MessageDto } from './dto/messageDto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({cors: true})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,

    private readonly jwtService: JwtService
  ) {}


  async handleConnection(client: Socket) {

    const token = client.handshake.headers.authorization as string;
    let payload : JwtPayload;

    try {

      payload = this.jwtService.verify(token);  
      await this.messagesWsService.addConnectedClients(client, payload.id);

    } catch (error) {
      client.disconnect();
      return;
    }
    // console.log({payload});

    //Unir cliente a una sala al conectarse
    // client.join("room1")
    // this.wss.to("room1").emit()

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeConnectedClients(client.id);
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  @SubscribeMessage('message-from-client')
  handleMessageClient(client: Socket, payload: MessageDto){
    
    // Solo a si mismo
    // client.emit("message-from-server", {
    //   fullName: "Soy yo",
    //   message: payload.message
    // })

    // A todos menos a si mismo
    // client.broadcast.emit("message-from-server", {
    //   fullName: "Soy yo",
    //   message: payload.message
    // });

    // Solo clientes conectados a sala room1
    // this.wss.to("room1");

    this.wss.emit("message-from-server", {
      fullName: this.messagesWsService.getFullName(client.id),
      message: payload.message
    });
  }



}
