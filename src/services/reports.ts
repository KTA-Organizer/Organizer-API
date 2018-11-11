import { Transaction, QueryBuilder } from "knex";
import { Report, ReportListItem, GoalComment } from "../models/Report";
import { datastore } from "../config/datastore";
import { fetchFullModule, fetchModules } from "./modules";
import _ from "lodash";
import { fetchUsers } from "./users";
import { GoalAggregateScore } from "../models/GoalScore";
import { convertNestedFields, addFilters } from "../util/knexHelpers";

export async function fetchUserGoalAggregateScores(trx: Transaction, studentid: number, moduleid: number, start: Date, end: Date): Promise<GoalAggregateScore[]> {
  const criteriaScoreAvgs: any[] = await trx.table("scores")
    .select("scores.criteriaid", "criteria.goalid", "criteria.weight").avg("scores.grade as average")
    .leftJoin("criteria", "scores.criteriaid", "criteria.id")
    .leftJoin("goals", "goals.id", "criteria.goalid")
    .leftJoin("domains", "domains.id", "goals.domainid")
    .leftJoin("modules", "modules.id", "domains.moduleid")
    .where({ "modules.id": moduleid, "studentid": studentid })
    .whereBetween("scores.creation", [start, end])
    .groupBy("scores.criteriaid");

  const goalCriteriaAvgs = criteriaScoreAvgs.reduce((agg, { goalid, weight, average }) => {
    const currentGoalScores = agg[goalid] || [];
    return ({
      ...agg,
      [goalid]: [...currentGoalScores, weight * average]
    });
  }, {});

  const goalAggregates = Object
    .keys(goalCriteriaAvgs)
    .map(goalid => {
      const scores = goalCriteriaAvgs[goalid];
      const average = _.sum(scores) / scores.length;
      return ({ goalid: parseInt(goalid), grade: Math.round(average) });
    });
  return goalAggregates;
}

export async function generateReport(trx: Transaction, teacherid: number, studentid: number, moduleid: number, termStart: Date, termEnd: Date) {
  const [module, goalAggregateScores] = await Promise.all([
    fetchFullModule(trx, moduleid),
    fetchUserGoalAggregateScores(trx, studentid, moduleid, termStart, termEnd)
  ]);
  const goalComments = goalAggregateScores.map(ga => ({
    goalid: ga.goalid,
    comment: "",
  }));

  const report: Report = {
    creation: new Date(),
    studentid,
    goalAggregateScores,
    module,
    teacherid,
    termStart,
    termEnd,
    goalComments,
    generalComment: ""
  };

  const id = await saveReportDocument(report);
  await insertReportRow(trx, id, report);
  return id;
}

const REPORT_DATASTORE_KEY = "report";

async function insertReportRow(trx: Transaction, id: string, report: Report) {
  await trx.table("reports").insert({
    id,
    studentid: report.studentid,
    teacherid: report.teacherid,
    termStart: report.termStart,
    termEnd: report.termEnd,
    moduleid: report.module.id,
    creation: report.creation
  });
}

export async function saveReportDocument(report: Report) {
  const key = datastore.key([REPORT_DATASTORE_KEY]);
  await datastore.save({ key, data: report });
  return key.id;
}

function getKey(id: string) {
  const key = datastore.key([REPORT_DATASTORE_KEY, id]);
  delete key.name;
  key.id = id;
  return key;
}

export async function fetchReport(id: string) {
  const [report] = await datastore.get(getKey(id));
  return report as Report;
}


export interface ReportFilters {
  studentid?: number;
  teacherid?: number;
  moduleid?: number;
  disciplineid?: number;
}

export async function fetchReports(trx: Transaction, filters: ReportFilters) {
  const query = trx.table("reports")
    .select(
      "reports.*",

      "disciplines.id as discipline.id",
      "disciplines.name as discipline.name",

      "modules.id as module.id",
      "modules.name as module.name",

      "student.id as student.id",
      "student.firstname as student.firstname",
      "student.lastname as student.lastname",

      "teacher.id as teacher.id",
      "teacher.firstname as teacher.firstname",
      "teacher.lastname as teacher.lastname",
     )
    .innerJoin("modules", "modules.id", "reports.moduleid")
    .innerJoin("disciplines", "disciplines.id", "modules.disciplineid")
    .innerJoin("users as student", "student.id", "reports.studentid")
    .innerJoin("users as teacher", "teacher.id", "reports.teacherid");

  addFilters(query, filters);

  const reports: ReportListItem[] = await query;
  return convertNestedFields(reports);
}

export async function updateComments(reportid: string, report: Report, generalComment: string, goalComments: GoalComment[]) {
  report.generalComment = generalComment;
  report.goalComments = goalComments;
  await datastore.update({
    key: getKey(reportid),
    data: report
  });
}