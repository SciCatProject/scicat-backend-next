export interface IAccessLogs {
  user: string | null;
  ip: string | undefined;
  userAgent: string | undefined;
  endpoint: string;
  statusCode: number;
  responseTime: number;
}
