import { User } from "./User";

export interface Admin extends User {
  stillAdmin: boolean;
}