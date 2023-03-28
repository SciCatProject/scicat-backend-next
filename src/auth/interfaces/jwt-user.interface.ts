export interface JWTUser {
  _id: string;
  username: string;
  email: string;
  currentGroups: string[];
  authStrategy?: string;
}
