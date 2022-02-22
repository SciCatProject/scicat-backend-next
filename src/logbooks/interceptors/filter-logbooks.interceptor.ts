import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { map, Observable } from "rxjs";
import { ProposalsService } from "src/proposals/proposals.service";
import { Logbook } from "../schemas/logbook.schema";

@Injectable()
export class FilterLogbooksInterceptor implements NestInterceptor {
  constructor(private readonly proposalsService: ProposalsService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<Logbook[]>> {
    const usersGroups = context.getArgs()[1].req.user.currentGroups;
    const proposals = await this.proposalsService.findAll({
      where: { ownerGroup: { $in: usersGroups } },
    });
    const proposalIds = proposals.map((proposal) => proposal.proposalId);

    return next
      .handle()
      .pipe(
        map((logbooks: Logbook[]) =>
          logbooks.filter((logbook) => proposalIds.includes(logbook.name)),
        ),
      );
  }
}
