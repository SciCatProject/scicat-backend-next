import { HttpService } from "@nestjs/axios";
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { handleAxiosRequestError } from "src/common/utils";
import { Logbook } from "./schemas/logbook.schema";
import { Message } from "./schemas/message.schema";

@Injectable()
export class LogbooksService {
  private logbookEnabled;
  private baseUrl;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.logbookEnabled = this.configService.get<boolean>("logbook.enabled");
    this.baseUrl = this.configService.get<string>("logbook.baseUrl");
  }

  async findAll(): Promise<Logbook[] | null> {
    if (this.logbookEnabled) {
      try {
        Logger.log("Fetching Logbooks", "LogbooksService.findAll");
        const res = await firstValueFrom(
          this.httpService.get<Logbook[]>(this.baseUrl + "/Logbooks"),
        );

        const nonEmptyLogbooks = res.data.filter(
          (logbook) => logbook.messages.length !== 0,
        );
        const emptyLogbooks = res.data.filter(
          (logbook) => logbook.messages.length === 0,
        );
        nonEmptyLogbooks
          .sort(
            (a, b) =>
              a.messages[a.messages.length - 1].origin_server_ts -
              b.messages[b.messages.length - 1].origin_server_ts,
          )
          .reverse();
        const logbooks = nonEmptyLogbooks.concat(emptyLogbooks);
        Logger.log("Found logbooks", "LogbooksService.findAll");
        return logbooks;
      } catch (error) {
        handleAxiosRequestError(error, "LogbooksService.findAll");
        throw new InternalServerErrorException("Fetching Logbooks failed");
      }
    }
    return [];
  }

  async findByName(name: string, filters: string): Promise<Logbook | null> {
    if (this.logbookEnabled) {
      try {
        Logger.log("Fetching logbook " + name, "LogbooksService.findByName");
        Logger.log(filters, "LogbooksService.findByName");
        const res = await firstValueFrom(
          this.httpService.get<Logbook>(
            this.baseUrl + `/Logbooks/${name}?filter=${filters}`,
          ),
        );

        if (!res.data) {
          Logger.log("Logbook not found", { name });
          return null;
        }

        Logger.log("Found logbook " + name, "LogbooksService.findByName");
        const { skip, limit, sortField } = JSON.parse(filters);
        Logger.log(
          "Applying filters skip: " +
            skip +
            ", limit: " +
            limit +
            ", sortField: " +
            sortField,
          "LogbooksService.findByName",
        );
        if (!!sortField && sortField.indexOf(":") > 0) {
          res.data.messages = sortMessages(res.data.messages, sortField);
        }
        if (skip >= 0 && limit >= 0) {
          const end = skip + limit;
          const messages = res.data.messages.slice(skip, end);
          return { ...res.data, messages };
        }
        return res.data;
      } catch (error) {
        handleAxiosRequestError(error, "LogbooksService.findByName");
      }
    }
    return null;
  }

  async sendMessage(
    name: string,
    data: { message: string },
  ): Promise<{ event_id: string } | null> {
    if (this.logbookEnabled) {
      try {
        Logger.log(
          "Sending message to room " + name,
          "LogbooksService.sendMessage",
        );
        const res = await firstValueFrom(
          this.httpService.post<{ event_id: string }>(
            this.baseUrl + `/Logbooks/${name}/message`,
            data,
          ),
        );
        Logger.log(
          "Message with eventId " + res.data.event_id + " sent to room " + name,
          "LogbooksService.sendMessage",
        );
        return res.data;
      } catch (error) {
        handleAxiosRequestError(error, "LogbooksService.sendMessage");
      }
    } else {
      throw new InternalServerErrorException(
        "Logbook username and/or password not configured",
      );
    }
    return null;
  }
}

const sortMessages = (messages: Message[], sortField: string): Message[] => {
  const [column, direction] = sortField.split(":");
  let sorted = messages.sort((a, b) => {
    switch (column) {
      case "timestamp": {
        return a.origin_server_ts - b.origin_server_ts;
      }
      case "sender": {
        if (a.sender.replace("@", "") < b.sender.replace("@", "")) {
          return -1;
        }
        if (a.sender.replace("@", "") > b.sender.replace("@", "")) {
          return 1;
        }
        return 0;
      }
      case "entry": {
        if (a.content.body < b.content.body) {
          return -1;
        }
        if (a.content.body > b.content.body) {
          return 1;
        }
        return 0;
      }
      default: {
        return 0;
      }
    }
  });
  if (direction === "desc") {
    sorted = sorted.reverse();
  }
  return sorted;
};
