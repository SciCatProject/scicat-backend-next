import { AsyncLocalStorage } from "async_hooks";
import { Request } from "express";
import { Logger } from "@nestjs/common";

const logger = new Logger("RequestContextUtil");

// Define an interface for the user object in the request
interface RequestUser {
  username?: string;
  // Add other properties as needed
}

/**
 * Creates a new AsyncLocalStorage instance to store the current request.
 */
const asyncLocalStorage = new AsyncLocalStorage<Request>();

/**
 * Sets the current request in the AsyncLocalStorage.
 * This function should be called at the beginning of each request.
 * It allows you to access the request object later in the application lifecycle.
 * For example, you can use it in a service or a controller to get the current request.
 * @param request The current request object.
 * @example
 * import { setCurrentRequest } from './path/to/this/file';
 * import { Request } from 'express';
 */
export function setCurrentRequest(request: Request) {
  asyncLocalStorage.enterWith(request);
}

/**
 * Gets the current request from the AsyncLocalStorage.
 * This function should be used to retrieve the request object
 * that was set at the beginning of the request lifecycle.
 * It returns undefined if called outside of a request context.
 * @returns The current request object or undefined if not available.
 * @example
 * const request = getCurrentRequest();
 * if (request) {
 *   console.log(request.method); // Logs the HTTP method of the current request
 * }
 */
export function getCurrentRequest(): Request | undefined {
  return asyncLocalStorage.getStore();
}

/**
 * Gets the current user from the request object stored in AsyncLocalStorage.
 * This function should be used to retrieve the user object
 * that was set at the beginning of the request lifecycle.
 * It returns undefined if called outside of a request context.
 * @returns The current user object or undefined if not available.
 */
export function getCurrentUsername(): string {
  try {
    const request = getCurrentRequest();

    if (!request) {
      return "no-request-context"; // Default value if no request is available
    }

    if (!request.user) {
      return "unauthenticated"; // Default value if no user is available
    }
    const requestUser = request.user;
    const anyRequestUser = requestUser as RequestUser;
    return anyRequestUser.username || "missing-username"; // More accurately reflects the situation
  } catch (e) {
    logger.error(
      "Error getting current username",
      e instanceof Error ? e.stack : String(e),
    );
    return "error-getting-username"; // Default value in case of an error
  }
}
