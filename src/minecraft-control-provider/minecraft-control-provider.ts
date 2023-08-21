import { Injectable } from '@nestjs/common';
import { MqttClient } from 'mqtt';
import { SensorUpdateListener } from '../cracow-sensor-update-provider/cracow-sensor-update-provider';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { minecraftControlTopics } from '../config';

// space > area > location > item > action
const aliasMap: Map<string, string> = new Map([
  ['main_base', 'spawn/central/base'],
]);

const items = ['front_door', 'back_door', 'garage_door', 'gate', 'window'];

const actions = ['open', 'close', 'lock', 'unlock', 'turnon', 'turnoff'];

@Injectable()
export class MinecraftControlProvider {
  private client: MqttClient;
  private wildcardListeners: SensorUpdateListener[] = [];

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
    const value = Number(message.toString());

    this.wildcardListeners.forEach((listener) => listener(value));
  }

  public registerWildcardListener(
    type: string,
    listener: SensorUpdateListener,
  ) {
    this.wildcardListeners.push(listener);
  }

  public sendMessage(topic: string, message: string) {
    this.client.publish(topic, message);
  }

  public sendMessageWithAlias(
    alias: string,
    item: string,
    action: string,
    message: string,
  ) {
    const topic = aliasMap[alias] + '/' + item + '/' + action;
    this.client.publish(topic, message);
  }
}
