import { Test, TestingModule } from '@nestjs/testing';
import { MinecraftSensorProvider } from './minecraft-sensor-provider';

describe('MinecraftSensorProvider', () => {
  let provider: MinecraftSensorProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinecraftSensorProvider],
    }).compile();

    provider = module.get<MinecraftSensorProvider>(MinecraftSensorProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
