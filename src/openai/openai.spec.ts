import { Test, TestingModule } from '@nestjs/testing';
import { Openai } from './openai';

describe('Openai', () => {
  let provider: Openai;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Openai],
    }).compile();

    provider = module.get<Openai>(Openai);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
