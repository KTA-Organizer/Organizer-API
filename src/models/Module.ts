import { Discipline } from "./Discipline";
import { User } from "./User";
import { Domain } from "./Domain";

export interface Module {
  id: number;
  name: string;
  active: boolean;
  creatorId: number;
  disciplineid: number;
  creation: Date;

  /**
   * Optional properties which are not columns
   */
  discipline?: Discipline;
  creator?: User;
  domains?: Domain[];
}
