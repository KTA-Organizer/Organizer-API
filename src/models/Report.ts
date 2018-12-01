import { Score } from "./Score";
import { User } from "./User";
import { Module } from "./Module";
import { GoalAggregateScore } from "./GoalScore";
import { EvaluationSheet } from "./EvaluationSheet";

export interface GoalComment {
  goalid: number;
  comment: string;
}

export interface ReportListItem {
  id?: string;
  evaluationsheetid: number;
  creation: Date;
  open: boolean;

  // module?: Module;
  // student?: User;
  // teacher?: User;
}

export interface Report extends ReportListItem {
  evaluationSheet: EvaluationSheet;
  goalAggregateScores: GoalAggregateScore[];

  goalComments: GoalComment[];
  generalComment: string;
}