import { Module } from '@nestjs/common';
import { InstrumentsService } from './instruments.service';
import { InstrumentsController } from './instruments.controller';

@Module({
  controllers: [InstrumentsController],
  providers: [InstrumentsService]
})
export class InstrumentsModule {}
