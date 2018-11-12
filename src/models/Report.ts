import { Score } from "./Score";
import { User } from "./User";
import { Module } from "./Module";
import { GoalAggregateScore } from "./GoalScore";

export interface GoalComment {
  goalid: number;
  comment: string;
}

export interface Report {
  studentid: number;
  teacherid: number;

  module: Module;
  goalAggregateScores: GoalAggregateScore[];
  creation: Date;
  termStart: Date;
  termEnd: Date;

  goalComments: GoalComment[];
  generalComment: string;

  student?: User;
  teacher?: User;
}

export interface ReportListItem {
  id: string;
  studentid: number;
  teacherid: number;
  termStart: Date;
  termEnd: Date;
  moduleid: number;
  creation: Date;

  module?: Module;
  student?: User;
  teacher?: User;
}