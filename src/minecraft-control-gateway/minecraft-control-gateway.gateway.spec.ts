import { Test, TestingModule } from '@nestjs/testing';
import { MinecraftControlGatewayGateway } from './minecraft-control-gateway.gateway';

describe('MinecraftControlGatewayGateway', () => {
  let gateway: MinecraftControlGatewayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinecraftControlGatewayGateway],
    }).compile();

    gateway = module.get<MinecraftControlGatewayGateway>(MinecraftControlGatewayGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
