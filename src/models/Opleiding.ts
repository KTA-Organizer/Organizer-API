import { User } from "./User";

export interface Opleiding {
  id: number;
  name: string;
  active: boolean;
  creatorId?: number;

  /**
   * Optional properties which are not columns
   */
  creator?: User;
}