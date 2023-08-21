import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MinecraftSensorProvider } from '../minecraft-sensor-provider/minecraft-sensor-provider';
import { mqttMessageDTO } from '../minecraft-control-gateway/minecraft-control-gateway.gateway';

@WebSocketGateway(81, {
  namespace: 'minecraft-sensory',
  cors: `localhost:*`,
})
export class MinecraftSensorGatewayGateway {
  constructor(private SensorUpdateProvider: MinecraftSensorProvider) {
    SensorUpdateProvider.registerWildcardListener((value, sensorType) => {
      const types = sensorType.split('/');
      for (let i = 0; i < types.length; i++) {
        this.server.to(types.slice(0, i + 1).join('/')).emit(sensorType, value);
      }
    });
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

  @SubscribeMessage('send-mqtt-message')
  handleMqttMessage(
    @MessageBody() data: mqttMessageDTO,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ConnectedSocket() socket: Socket,
  ): void {
    if (typeof data == 'string') {
      data = JSON.parse(data);
    }

    this.SensorUpdateProvider.sendMessage(data.topic, data.message);
    return;
  }
}
