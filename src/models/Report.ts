import { Score } from "./Score";
import { User } from "./User";
import { Module } from "./Module";

export interface GoalComment {
  goalid: number;
  comment: string;
}

export interface Report {
  studentid: number;
  teacherid: number;

  module: Module;
  scores: Score[];
  creation: Date;
  termStart: Date;
  termEnd: Date;

  goalComments: GoalComment[];
  generalComment: string;
}

export interface ReportListItem {
  moduleid: number;
  studentid: number;
  teacherid: number;

  module?: Module;
  student?: User;
  teacher?: User;
}