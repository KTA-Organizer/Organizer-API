import { Goal } from "./Goal";

export interface Domain {
  id: number;
  moduleid: number;
  name: string;
  active: number;
  creatorId: number;
  creation: Date;

  goals: Goal[];
}