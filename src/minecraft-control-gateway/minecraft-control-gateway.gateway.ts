import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SensorType } from '../cracow-sensor-update-provider/cracow-sensor-update-provider';
import { Server, Socket } from 'socket.io';
import {
  MinecraftControlProvider,

} from '../minecraft-control-provider/minecraft-control-provider';
import {
  PermissionCheckRequest,
  PermissionCheckResponse,
} from '../authorization/checkRequest';
import { PermissionDb } from '../authorization/tempDb';
import { hasPermission, Permission } from '../authorization/permission';
import { Openai, OpenAiFunction } from '../openai/openai';
import { actions, aliasMap, areas, items, locations, spaces } from "../config";

export interface mqttMessageDTO {
  topic: string;
  message: string;
}

// space > area > location > item > action
const functions: OpenAiFunction[] = [
  {
    name: 'sendMessage',
    description:
      'Sends an action to an item in a specified location within an area within a space',
    parameters: {
      type: 'object',
      properties: {
        space: { type: 'string', description: 'The broad space', enum: spaces },
        area: {
          type: 'string',
          description: 'The area within the space',
          enum: areas,
        },
        location: {
          type: 'string',
          description: 'The location within the area',
          enum: locations,
        },
        item: {
          type: 'string',
          description: 'The item within the location',
          enum: items,
        },
        action: {
          type: 'string',
          description: 'The action to perform on the item',
          action: actions,
        },
      },
      required: ['space', 'area', 'location', 'item', 'action'],
    },
  },
  {
    name: 'sendActionWithAlias',
    description:
      'Sends an action to an item within a location defined by an alias',
    parameters: {
      type: 'object',
      properties: {
        alias: {
          type: 'string',
          description: 'The alias of the location',
          enum: Object.keys(aliasMap),
        },
        item: {
          type: 'string',
          description: 'The item within the location',
          enum: items,
        },
        action: {
          type: 'string',
          description: 'The action to perform on the item',
          action: actions,
        },
      },
      required: ['alias', 'item', 'action'],
    },
  },
];

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
    const { space, area, location, item, action, alias } = JSON.parse(argument);

    switch (name) {
      case 'sendMessage':
        const topic = `${space}/${area}/${location}/${item}`;
        this.ControlProvider.sendMessage(topic, action);
        return `Sent ${action} to ${item} in ${location} in ${area} in ${space}`;
      case 'sendActionWithAlias':
        this.ControlProvider.sendActionWithAlias(alias, item, action);
        return `Sent ${action} to ${item} in ${alias}`;
      default:
        return 'Unknown function';
    }
  };

  @SubscribeMessage('openai-action')
  handleOpenAIAction(
    @MessageBody() prompt: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    this.openai
      .callOpenAi(prompt, functions, this.callFunction)
      .then((response) => {
        console.log(response);
        socket.emit('openai-action', response);
      });
  }
}
