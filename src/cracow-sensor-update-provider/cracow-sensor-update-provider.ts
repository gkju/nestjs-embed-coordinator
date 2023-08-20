import { Injectable } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import * as mqtt from "mqtt";
import { MqttClient } from "mqtt";
import { krakowSensorsTopic } from "../config";

export enum SensorType {
  PM10 = 'skotnikipm10',
  PM25 = 'skotnikipm2',
  PM1 = 'skotnikipm1',
  AQI_PM10 = 'aqipm10',
  AQI_PM25 = 'aqipm2',
  PRESSURE = 'presPa',
  ATMOSPHERIC_PRESSURE = 'atmopresPa',
  HUMIDITY = 'humRH',
  TEMPERATURE = 'tempC',
}

export type SensorUpdateListener = (value: number) => void;

@Injectable()
export class CracowSensorUpdateProvider {
  private client: MqttClient;
  private listeners: Map<SensorType, SensorUpdateListener[]> = new Map<
    SensorType,
    SensorUpdateListener[]
  >([]);

  constructor(private configService: ConfigService) {
    this.client = mqtt.connect(configService.get<string>('MQTT_ADDRESS'), {
      port: configService.get<number>('MQTT_PORT'),
      username: configService.get<string>('MQTT_USERNAME'),
      password: configService.get<string>('MQTT_PASSWORD'),
    });

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.client.subscribe(krakowSensorsTopic);
    });

    this.client.on('message', this.MessageHandler.bind(this));
  }

  private MessageHandler(topic: string, message: Buffer) {
    const sensorType = <SensorType>topic.split('/').slice(-2).join('');
    const value = Number(message.toString());
    if (this.listeners.has(sensorType)) {
      this.listeners.get(sensorType).forEach((listener) => listener(value));
    }
  }

  public registerListener(type: SensorType, listener: SensorUpdateListener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(listener);
  }
}
