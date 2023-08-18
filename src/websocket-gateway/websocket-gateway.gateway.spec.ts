import { Test, TestingModule } from '@nestjs/testing';
import { WebsocketGatewayGateway } from './websocket-gateway.gateway';

describe('WebsocketGatewayGateway', () => {
  let gateway: WebsocketGatewayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebsocketGatewayGateway],
    }).compile();

    gateway = module.get<WebsocketGatewayGateway>(WebsocketGatewayGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
