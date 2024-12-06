import { JobActionOptions } from "../../jobconfig.interface";

export const actionType = "rabbitmq";

export interface RabbitMQJobActionOptions extends JobActionOptions {
  actionType: typeof actionType;
  hostname: string;
  port: number;
  username: string;
  password: string;
  exchange: string;
  queue: string;
  key: string;
}

/**
 * Type guard for RabbitMQJobActionOptions
 */
export function isRabbitMQJobActionOptions(
  options: unknown,
): options is RabbitMQJobActionOptions {
  if (typeof options !== "object" || options === null) {
    return false;
  }

  const opts = options as RabbitMQJobActionOptions;
  return (
    opts.actionType === actionType &&
    typeof opts.hostname === "string" &&
    typeof opts.port === "number" &&
    typeof opts.username === "string" &&
    typeof opts.password === "string" &&
    typeof opts.exchange === "string" &&
    typeof opts.queue === "string" &&
    typeof opts.key === "string"
  );
}
