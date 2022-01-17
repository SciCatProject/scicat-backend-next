import { Module } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { ProposalsController } from './proposals.controller';

@Module({
  controllers: [ProposalsController],
  providers: [ProposalsService]
})
export class ProposalsModule {}
