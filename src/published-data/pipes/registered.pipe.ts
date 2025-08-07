import { Inject, Injectable, PipeTransform, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { omit } from "lodash";

function addRegisteredStatusToJson(
  json: Record<string, string>,
  isAuthenticated = false,
) {
  if (isAuthenticated) return json;
  return { ...json, status: "registered" };
}

@Injectable({ scope: Scope.REQUEST })
export class RegisteredFilterPipe
  implements
    PipeTransform<
      { filter?: string; fields?: string; limits?: string },
      { filter?: string; fields?: string; limits?: string }
    >
{
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  transform(value: { filter?: string; fields?: string; limits?: string }) {
    const jsonFields = JSON.parse(value?.fields || "{}");
    const withRegistered = addRegisteredStatusToJson(
      jsonFields,
      this.request.isAuthenticated(),
    );
    return { ...value, fields: JSON.stringify(withRegistered) };
  }
}

@Injectable({ scope: Scope.REQUEST })
export class RegisteredPipe
  implements PipeTransform<Record<string, string>, Record<string, string>>
{
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  transform(value: Record<string, string>) {
    return addRegisteredStatusToJson(value, this.request.isAuthenticated());
  }
}

export class IdToDoiPipe
  implements PipeTransform<{ id: string }, { doi: string }>
{
  transform(value: { id: string }) {
    return { ...omit(value, "id"), doi: value.id };
  }
}
