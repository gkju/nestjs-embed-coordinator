import { Test, TestingModule } from '@nestjs/testing';
import { CracowSensorUpdateProvider } from './cracow-sensor-update-provider';

describe('CracowSensorUpdateProvider', () => {
  let provider: CracowSensorUpdateProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CracowSensorUpdateProvider],
    }).compile();

    provider = module.get<CracowSensorUpdateProvider>(CracowSensorUpdateProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
