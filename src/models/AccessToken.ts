import { User } from "./User";

export enum AccessTokenType {
  passwordReset = "PASSWORD_RESET",
  invitation = "INVITATION",
}
export interface AccessToken {
  userid: number;
  tokenTimestamp: Date;
  token: string;

  type?: AccessTokenType;
  user?: User;
}