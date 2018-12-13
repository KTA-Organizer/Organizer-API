import { User } from "./User";
import { Module } from "./Module";
import { Score } from "./Score";
import { Discipline } from "./Discipline";

export interface EvaluationSheet {
  id: number;
  startdate: Date;
  enddate?: Date;
  studentid: number;
  teacherid: number;
  moduleid: number;
  periodname: string;

  student?: User;
  teacher?: User;
  scores?: Score[];
  module?: Module;
  discipline?: Discipline;
}