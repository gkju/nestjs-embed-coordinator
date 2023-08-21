import { Injectable } from "@nestjs/common";
import * as mqtt from "mqtt";
import { MqttClient } from "mqtt";
import { SensorUpdateListener } from "../cracow-sensor-update-provider/cracow-sensor-update-provider";
import { ConfigService } from "@nestjs/config";
import { aliasMap, minecraftControlTopics } from "../config";

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

  public sendActionWithAlias(
    alias: string,
    item: string,
    action: string,
    room: string,
  ) {
    // `${space}/${area}/${location}/${room}/${item}`
    const topic = aliasMap[alias] + `/${room}/${item}`;
    this.client.publish(topic, action);
  }
}
