import { Test, TestingModule } from '@nestjs/testing';
import { ProposalsService } from './proposals.service';

describe('ProposalsService', () => {
  let service: ProposalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProposalsService],
    }).compile();

    service = module.get<ProposalsService>(ProposalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
