import { Injectable } from "@nestjs/common";
import {
  getCurrentRequest,
  getCurrentUsername as getUsername,
} from "../utils/request-context.util";
import { Request } from "express";

@Injectable()
export class UserContextService {
  /**
   * Gets the current request from the AsyncLocalStorage.
   * @returns The current request object or undefined if not available.
   */
  getCurrentRequest(): Request | undefined {
    return getCurrentRequest();
  }

  /**
   * Gets the current user from the request object stored in AsyncLocalStorage.
   * @returns The current user object or undefined if not available.
   */
  getCurrentUsername(): string {
    return getUsername();
  }
}
