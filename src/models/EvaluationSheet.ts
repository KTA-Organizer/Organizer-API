import { User } from "./User";
import { Module } from "./Module";
import { Score } from "./Score";

export interface EvaluationSheet {
  id: number;
  startdate: Date;
  enddate?: Date;
  studentid: number;
  teacherid: number;
  moduleid: number;

  student?: User;
  teacher?: User;
  scores?: Score[];
  module?: Module;
}