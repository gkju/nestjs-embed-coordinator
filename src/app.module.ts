import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebsocketGatewayGateway } from './websocket-gateway/websocket-gateway.gateway';
import { CracowSensorUpdateProvider } from './cracow-sensor-update-provider/cracow-sensor-update-provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, WebsocketGatewayGateway, CracowSensorUpdateProvider],
})
export class AppModule {}
