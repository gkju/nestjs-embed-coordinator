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
import { IsNotEmpty } from 'class-validator';

export class mqttMessageDTO {
  @IsNotEmpty()
  topic: string;
  @IsNotEmpty()
  message: string;
}

class OpenAiActionRequest {
  @IsNotEmpty()
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
    ControlProvider.registerWildcardListener((value, topic) => {
      const types = topic.split('/');
      for (let i = 0; i < types.length; i++) {
        this.server.to(types.slice(0, i + 1).join('/')).emit(topic, value);
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

    this.ControlProvider.sendMessage(data.topic, data.message);
    return;
  }

  @SubscribeMessage('check-permissions')
  handleCheckPermissions(
    @MessageBody() data: PermissionCheckRequest,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ConnectedSocket() socket: Socket,
  ): void {
    if (typeof data == 'string') {
      data = JSON.parse(data);
    }

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
    const { city, area, location, item, action, alias, room } =
      JSON.parse(argument);

    switch (name) {
      case 'sendMessage':
        const topic = `${city}/${area}/${location}/${room}/${item}`;
        this.ControlProvider.sendMessage(topic, JSON.stringify(action));
        return `Sent ${JSON.stringify(
          action,
        )} to ${item} in ${room} in ${location} in ${area} in ${city}`;
      case 'sendActionWithAlias':
        this.ControlProvider.sendActionWithAlias(alias, item, action, room);
        return `Sent ${JSON.stringify(
          action,
        )} to ${item} in ${room} at ${alias}`;
      default:
        return 'Unknown function';
    }
  };

  @SubscribeMessage('openai-action')
  handleOpenAIAction(
    @MessageBody() data: OpenAiActionRequest,
    @ConnectedSocket() socket: Socket,
  ): void {
    if (typeof data == 'string') {
      data = JSON.parse(data);
    }
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
