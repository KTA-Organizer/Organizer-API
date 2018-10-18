import { User } from "./User";

export interface AccessToken {
  userid: number;
  tokenTimestamp: Date;
  token: string;

  user?: User;
}