import { Injectable } from "@nestjs/common";
import { CreatePublishedDatumDto } from "./dto/create-published-data.dto";
import { UpdatePublishedDatumDto } from "./dto/update-published-data.dto";

@Injectable()
export class PublishedDataService {
  create(createPublishedDatumDto: CreatePublishedDatumDto) {
    return "This action adds a new publishedDatum";
  }

  findAll() {
    return `This action returns all publishedData`;
  }

  findOne(id: number) {
    return `This action returns a #${id} publishedDatum`;
  }

  update(id: number, updatePublishedDatumDto: UpdatePublishedDatumDto) {
    return `This action updates a #${id} publishedDatum`;
  }

  remove(id: number) {
    return `This action removes a #${id} publishedDatum`;
  }
}
