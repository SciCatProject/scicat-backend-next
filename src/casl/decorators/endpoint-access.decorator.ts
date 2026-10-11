import { SetMetadata } from "@nestjs/common";
import { IEndpointCheck } from "../interfaces/endpoint-check.interface";

export const ENDPOINT_ACCESS_KEY = "endpoint_access";

export const EndpointAccess = (...checks: IEndpointCheck[]) =>
  SetMetadata(ENDPOINT_ACCESS_KEY, [...checks]);
