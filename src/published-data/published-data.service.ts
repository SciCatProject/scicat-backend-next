import { Injectable } from "@nestjs/common";
import { CreatePublishedDataDto } from "./dto/create-published-data.dto";
import { UpdatePublishedDataDto } from "./dto/update-published-data.dto";

@Injectable()
export class PublishedDataService {
  create(createPublishedDataDto: CreatePublishedDataDto) {
    return "This action adds a new publishedDatum";
  }

  findAll() {
    return `This action returns all publishedData`;
  }

  findOne(id: number) {
    return `This action returns a #${id} publishedDatum`;
  }

  update(id: number, updatePublishedDataDto: UpdatePublishedDataDto) {
    return `This action updates a #${id} publishedDatum`;
  }

  remove(id: number) {
    return `This action removes a #${id} publishedDatum`;
  }
}
