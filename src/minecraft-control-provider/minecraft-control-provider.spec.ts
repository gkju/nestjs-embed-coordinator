import { Test, TestingModule } from '@nestjs/testing';
import { MinecraftControlProvider } from './minecraft-control-provider';

describe('MinecraftControlProvider', () => {
  let provider: MinecraftControlProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinecraftControlProvider],
    }).compile();

    provider = module.get<MinecraftControlProvider>(MinecraftControlProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
