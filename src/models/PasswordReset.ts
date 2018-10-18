import { User } from "./User";

export interface PasswordReset {
  userid: number;
  tokenTimestamp: Date;
  token: string;

  user?: User;
}