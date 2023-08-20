import { Injectable } from '@nestjs/common';
import { SensorUpdateListener } from '../cracow-sensor-update-provider/cracow-sensor-update-provider';
import { MqttClient } from 'mqtt';
import { minecraftTopics } from '../config';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';

@Injectable()
export class MinecraftSensorProvider {
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
      this.client.subscribe(minecraftTopics);
    });

    this.client.on('message', this.MessageHandler.bind(this));
  }

  private MessageHandler(topic: string, message: Buffer) {
    const value = Number(message.toString());

    this.wildcardListeners.forEach((listener) => listener(value));
  }

  public registerWildcardListener(type: string, listener: SensorUpdateListener) {
    this.wildcardListeners.push(listener);
  }
}
