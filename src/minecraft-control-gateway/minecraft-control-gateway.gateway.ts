import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SensorType } from '../cracow-sensor-update-provider/cracow-sensor-update-provider';
import { Server, Socket } from 'socket.io';
import { MinecraftControlProvider } from '../minecraft-control-provider/minecraft-control-provider';
import {
  PermissionCheckRequest,
  PermissionCheckResponse,
} from '../authorization/checkRequest';
import { PermissionDb } from '../authorization/tempDb';
import { hasPermission, Permission } from '../authorization/permission';
import { Openai } from '../openai/openai';
import { functions } from '../config';

export interface mqttMessageDTO {
  topic: string;
  message: string;
}

interface OpenAiActionRequest {
  prompt: string;
  conversationId?: string;
}

@WebSocketGateway(81, {
  namespace: 'minecraft-control',
  cors: `localhost:*`,
})
export class MinecraftControlGatewayGateway {
  constructor(
    private ControlProvider: MinecraftControlProvider,
    private openai: Openai,
  ) {
    for (const sensorType of Object.values(SensorType)) {
      ControlProvider.registerWildcardListener(sensorType, (value) => {
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

  @SubscribeMessage('send-mqtt-message')
  handleMqttMessage(
    @MessageBody() data: mqttMessageDTO,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ConnectedSocket() socket: Socket,
  ): void {
    this.ControlProvider.sendMessage(data.topic, data.message);
    return;
  }

  @SubscribeMessage('check-permissions')
  handleCheckPermissions(
    @MessageBody() data: PermissionCheckRequest,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ConnectedSocket() socket: Socket,
  ): void {
    const userPerms = PermissionDb[data.user];
    const response = new PermissionCheckResponse(data);
    response.hasPermission = hasPermission(
      userPerms,
      Permission.fromArray(data.permission),
    );
    response.signature = 'lolzxd';

    socket.emit('check-permissions', response);
  }

  private callFunction = (name: string, argument: string) => {
    console.log('Calling function', name, argument);
    const { space, area, location, item, action, alias, room } = JSON.parse(argument);

    switch (name) {
      case 'sendMessage':
        const topic = `${space}/${area}/${location}/${room}/${item}`;
        this.ControlProvider.sendMessage(topic, action);
        return `Sent ${action} to ${item} in ${room} in ${location} in ${area} in ${space}`;
      case 'sendActionWithAlias':
        this.ControlProvider.sendActionWithAlias(alias, item, action, room);
        return `Sent ${action} to ${item} in ${room} at ${alias}`;
      default:
        return 'Unknown function';
    }
  };

  @SubscribeMessage('openai-action')
  handleOpenAIAction(
    @MessageBody() data: OpenAiActionRequest,
    @ConnectedSocket() socket: Socket,
  ): void {
    this.openai
      .callOpenAi(
        data.prompt,
        functions,
        this.callFunction,
        data.conversationId,
      )
      .then((response) => {
        console.log(response);
        socket.emit('openai-action', response);
      });
  }
}
