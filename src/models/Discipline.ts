import { User } from "./User";
import { Module } from "./Module";

export interface Discipline {
  id: number;
  name: string;
  active: boolean;
  creatorId?: number;

  /**
   * Optional properties which are not columns
   */
  creator?: User;
  modules?: Module[];
}