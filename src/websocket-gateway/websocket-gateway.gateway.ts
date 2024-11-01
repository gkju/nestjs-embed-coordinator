import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CracowSensorUpdateProvider, SensorType } from "../cracow-sensor-update-provider/cracow-sensor-update-provider";

@WebSocketGateway(81, {
  namespace: 'krakow-sensory',
  cors: `localhost:*`,
})
export class WebsocketGatewayGateway {
  constructor(private SensorUpdateProvider: CracowSensorUpdateProvider) {
    for (const sensorType of Object.values(SensorType)) {
      SensorUpdateProvider.registerListener(<SensorType>sensorType, (value) => {
        this.server.to(sensorType).emit(sensorType, value);
      });
    }
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('listen-sensor')
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() socket: Socket,
  ): string {
    socket.join(data);
    return 'Hello world!' + data;
  }
}
