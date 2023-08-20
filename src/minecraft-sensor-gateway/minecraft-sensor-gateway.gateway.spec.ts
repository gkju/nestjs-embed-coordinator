import { Test, TestingModule } from '@nestjs/testing';
import { MinecraftSensorGatewayGateway } from './minecraft-sensor-gateway.gateway';

describe('MinecraftSensorGatewayGateway', () => {
  let gateway: MinecraftSensorGatewayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinecraftSensorGatewayGateway],
    }).compile();

    gateway = module.get<MinecraftSensorGatewayGateway>(MinecraftSensorGatewayGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
