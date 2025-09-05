import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { InstrumentsController } from './instruments.controller';
import { InstrumentsService } from './instruments.service';
import {
  NotFoundException,
  HttpException,
  ConflictException,
} from '@nestjs/common';
import { MongoError } from 'mongodb';

class InstrumentsServiceMock {
  findOne = jest.fn();
  update = jest.fn();
}

class CaslAbilityFactoryMock {}

describe('InstrumentsController', () => {
  let controller: InstrumentsController;
  let service: InstrumentsServiceMock;

  const mockInstrument = {
    _id: '123',
    updatedAt: new Date('2025-09-01T10:00:00Z'),
  };

  const mockUpdateDto = { name: 'Updated Instrument' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [InstrumentsController],
      providers: [
        { provide: InstrumentsService, useClass: InstrumentsServiceMock },
        { provide: CaslAbilityFactory, useClass: CaslAbilityFactoryMock },
      ],
    }).compile();

    controller = module.get<InstrumentsController>(InstrumentsController);
    service = module.get<InstrumentsService>(InstrumentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw NotFoundException if instrument not found', async () => {
    service.findOne.mockResolvedValue(null);

    await expect(controller.update('123', mockUpdateDto, {})).rejects.toThrow(NotFoundException);
  });

  it('should update if header is missing', async () => {
    service.findOne.mockResolvedValue(mockInstrument);
    service.update.mockResolvedValue({ ...mockInstrument, ...mockUpdateDto });

    const result = await controller.update('123', mockUpdateDto, {});
    expect(result).toEqual({ ...mockInstrument, ...mockUpdateDto });
  });

  it('should throw PRECONDITION_FAILED if header date <= updatedAt', async () => {
    service.findOne.mockResolvedValue(mockInstrument);

    const headers = {
      'if-unmodified-since': '2025-09-01T09:00:00Z',
    };

    await expect(controller.update('123', mockUpdateDto, headers)).rejects.toThrow(HttpException);
  });

  it('should update if header date > updatedAt', async () => {
    service.findOne.mockResolvedValue(mockInstrument);
    service.update.mockResolvedValue({ ...mockInstrument, ...mockUpdateDto });

    const headers = {
      'if-unmodified-since': '2025-09-02T10:00:00Z',
    };

    const result = await controller.update('123', mockUpdateDto, headers);
    expect(result).toEqual({ ...mockInstrument, ...mockUpdateDto });
  });

  it('should throw ConflictException on duplicate key error', async () => {
    service.findOne.mockResolvedValue(mockInstrument);
    service.update.mockRejectedValue({ code: 11000 } as MongoError);

    await expect(controller.update('123', mockUpdateDto, {})).rejects.toThrow(ConflictException);
  });

});
