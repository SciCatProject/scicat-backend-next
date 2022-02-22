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
  private logbookEnabled = this.configService.get<boolean>("logbook.enabled");
  private baseUrl = this.configService.get<string>("logbook.baseUrl");
  private username = this.configService.get<string>("logbook.username");
  private password = this.configService.get<string>("logbook.password");

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async login(username: string, password: string): Promise<{ token: string }> {
    const credentials = { username, password };
    try {
      const res = await firstValueFrom(
        this.httpService.post(this.baseUrl + "/Users/login", credentials),
      );
      return res.data;
    } catch (error) {
      handleAxiosRequestError(error, "LogbooksService.login");
      throw new InternalServerErrorException("Logbook login failed");
    }
  }

  async findAll(): Promise<Logbook[] | null> {
    if (this.logbookEnabled) {
      if (this.username && this.password) {
        try {
          const accessToken = await this.login(this.username, this.password);
          Logger.log("Fetching Logbooks", "LogbooksService.findAll");
          const res = await firstValueFrom(
            this.httpService.get<Logbook[]>(this.baseUrl + "/Logbooks", {
              headers: { Authorization: `Bearer ${accessToken.token}` },
            }),
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
      } else {
        throw new InternalServerErrorException(
          "Logbook username and/or password not configured",
        );
      }
    }
    return [];
  }

  async findByName(name: string, filters: string): Promise<Logbook | null> {
    if (this.logbookEnabled) {
      if (this.username && this.password) {
        try {
          const accessToken = await this.login(this.username, this.password);
          Logger.log("Fetching logbook " + name, "LogbooksService.findByName");
          Logger.log(filters, "LogbooksService.findByName");
          const res = await firstValueFrom(
            this.httpService.get<Logbook>(
              this.baseUrl + `/Logbooks/${name}?filter=${filters}`,
              { headers: { Authorization: `Bearer ${accessToken.token}` } },
            ),
          );
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
      } else {
        throw new InternalServerErrorException(
          "Logbook username and/or password not configured",
        );
      }
    }
    return null;
  }

  async sendMessage(
    name: string,
    data: { message: string },
  ): Promise<{ event_id: string } | null> {
    if (this.logbookEnabled) {
      if (this.username && this.password) {
        try {
          const accessToken = await this.login(this.username, this.password);
          Logger.log(
            "Sending message to room " + name,
            "LogbooksService.sendMessage",
          );
          const res = await firstValueFrom(
            this.httpService.post<{ event_id: string }>(
              this.baseUrl + `/Logbooks/${name}/message`,
              data,
              { headers: { Authorization: `Bearer ${accessToken.token}` } },
            ),
          );
          Logger.log(
            "Message with eventId " +
              res.data.event_id +
              " sent to room " +
              name,
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
