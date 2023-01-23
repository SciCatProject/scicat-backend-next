export interface UserPayload {
  userId: string;
  username?: string;
  email?: string;
  accessGroupProperty?: string;
  payload?: Record<string, unknown>;
}
