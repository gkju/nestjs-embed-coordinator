import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebsocketGatewayGateway } from './websocket-gateway/websocket-gateway.gateway';
import { CracowSensorUpdateProvider } from './cracow-sensor-update-provider/cracow-sensor-update-provider';
import { ConfigModule } from '@nestjs/config';
import { MinecraftSensorProvider } from './minecraft-sensor-provider/minecraft-sensor-provider';
import { MinecraftSensorGatewayGateway } from './minecraft-sensor-gateway/minecraft-sensor-gateway.gateway';
import { MinecraftControlGatewayGateway } from './minecraft-control-gateway/minecraft-control-gateway.gateway';
import { MinecraftControlProvider } from './minecraft-control-provider/minecraft-control-provider';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, WebsocketGatewayGateway, CracowSensorUpdateProvider, MinecraftSensorProvider, MinecraftSensorGatewayGateway, MinecraftControlGatewayGateway, MinecraftControlProvider],
})
export class AppModule {}
