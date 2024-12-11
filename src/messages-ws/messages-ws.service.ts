import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients{
    [id: string]: {
        socket: Socket,
        user: User
    }
}

@Injectable()
export class MessagesWsService {

    constructor(

        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){}

    private connectedClients: ConnectedClients = {};

    async addConnectedClients(client: Socket, userId: string){

        const user = await this.userRepository.findOneBy({id: userId});
        if(!user) throw new Error(`User not found!`);
        if(!user.isActive) throw new Error(`User is not active!`);

        this.checkUsers(user);

        this.connectedClients[client.id] = {
            socket: client,
            user
        };
    }

    removeConnectedClients(id: string){
        delete this.connectedClients[id];
    }

    getConnectedClients(): string[]{
        return Object.keys(this.connectedClients);
    }

    getFullName(userId: string): string{
        return this.connectedClients[userId].user.fullName;
    }

    private checkUsers(user: User) {

        for (const clientId of Object.keys(this.connectedClients)) {

            const connectClient = this.connectedClients[clientId];

            if(connectClient.user.id === user.id){
                connectClient.socket.disconnect();
                break;
            }
        }
    }

}
