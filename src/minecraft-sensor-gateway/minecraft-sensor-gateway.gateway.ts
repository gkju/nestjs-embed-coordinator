import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SensorType } from '../cracow-sensor-update-provider/cracow-sensor-update-provider';
import { Server, Socket } from 'socket.io';
import { MinecraftSensorProvider } from '../minecraft-sensor-provider/minecraft-sensor-provider';

@WebSocketGateway(81, {
  namespace: 'minecraft-sensory',
  cors: `localhost:*`,
})
export class MinecraftSensorGatewayGateway {
  constructor(private SensorUpdateProvider: MinecraftSensorProvider) {
    for (const sensorType of Object.values(SensorType)) {
      SensorUpdateProvider.registerWildcardListener(sensorType, (value) => {
        const types = sensorType.split('/');
        for (let i = 0; i < types.length; i++) {
          this.server
            .to(types.slice(0, i + 1).join('/'))
            .emit(sensorType, value);
        }
      });
    }
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('listen-sensor')
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    socket.join(data);
    return;
  }
}
