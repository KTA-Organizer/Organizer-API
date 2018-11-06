import { User } from "./User";

export enum Grade {
  goed = 4,
  voldoende = 3,
  onvoldoende = 2,
  ro = 1
}

export interface Score {
  id: number;
  name: string;
  grade: Grade;
  creatorId: number;
  criteriaid: number;
  userid: number;
  creation: Date;

  /**
   * Optional properties which are not columns
   */
  creator?: User;
  criteria?: User;
  user?: User;
}