import { Injectable } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { MqttClient } from 'mqtt';
import { SensorUpdateListener } from '../cracow-sensor-update-provider/cracow-sensor-update-provider';
import { ConfigService } from '@nestjs/config';
import {
  aliasMap,
  minecraftControlTopicPrefix,
  minecraftControlTopics,
} from '../config';
import { WildcardSensorUpdateListener } from '../minecraft-sensor-provider/minecraft-sensor-provider';

@Injectable()
export class MinecraftControlProvider {
  private client: MqttClient;
  private wildcardListeners: WildcardSensorUpdateListener[] = [];

  constructor(private configService: ConfigService) {
    this.client = mqtt.connect(configService.get<string>('MQTT_ADDRESS'), {
      port: configService.get<number>('MQTT_PORT'),
      username: configService.get<string>('MQTT_USERNAME'),
      password: configService.get<string>('MQTT_PASSWORD'),
    });

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.client.subscribe(minecraftControlTopics);
    });

    this.client.on('message', this.MessageHandler.bind(this));
  }

  private MessageHandler(topic: string, message: Buffer) {
    this.wildcardListeners.forEach((listener) =>
      listener(message.toString(), topic),
    );
  }

  public registerWildcardListener(listener: WildcardSensorUpdateListener) {
    this.wildcardListeners.push(listener);
  }

  public sendMessage(topic: string, message: string) {
    this.client.publish(minecraftControlTopicPrefix + topic, message);
  }

  public sendActionWithAlias(
    alias: string,
    item: string,
    action: string,
    room: string,
  ) {
    // `${space}/${area}/${location}/${room}/${item}`
    const topic = aliasMap[alias] + `/${room}/${item}`;
    this.client.publish(minecraftControlTopicPrefix + topic, action);
  }
}
