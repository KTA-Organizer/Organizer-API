import { Transaction } from "knex";
import { Report, ReportListItem, GoalComment } from "../models/Report";
import { datastore } from "../config/datastore";
import { fetchFullModule, fetchModules } from "./modules";
import _ from "lodash";
import { fetchUsers } from "./users";

export async function fetchUserScores(trx: Transaction, studentid: number, moduleid: number) {
  const evaluations = await trx.table("scores")
    .select("scores.criteriaid").avg("scores.grade as average")
    .leftJoin("criteria", "scores.criteriaid", "criteria.id")
    .leftJoin("goals", "goals.id", "criteria.goalid")
    .leftJoin("domains", "domains.id", "goals.domainid")
    .leftJoin("modules", "modules.id", "domains.moduleid")
    .where({ "modules.id": moduleid, "studentid": studentid })
    .groupBy("scores.criteriaid");
  return evaluations;
}

export async function generateReport(trx: Transaction, teacherid: number, studentid: number, moduleid: number, termStart: Date, termEnd: Date) {
  const [module, scores] = await Promise.all([
    fetchFullModule(trx, moduleid),
    fetchUserScores(trx, studentid, moduleid)
  ]);
  const report: Report = {
    creation: new Date(),
    studentid,
    scores,
    module,
    teacherid,
    termStart,
    termEnd,
    goalComments: [],
    generalComment: ""
  };

  const id = await saveReport(report);
  return id;
}

const REPORT_DATASTORE_KEY = "report";

export async function saveReport(report: Report) {
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
}

async function getReports(filters: ReportFilters) {
  const query = datastore.createQuery(REPORT_DATASTORE_KEY);
  const fields = ["studentid", "module.id", "teacherid"];
  if (filters.studentid) {
    query.filter("studentid", "=", filters.studentid);
    fields.splice(0, 1);
  }
  query.select(fields);
  query.order("creation", { descending: true });
  let [data] = await datastore.runQuery(query);

  if (filters.studentid) {
    data.forEach((d: any) => d.studentid = filters.studentid);
  }

  data = data.map((d: any) => ({
    id: d[datastore.KEY].id,
    studentid: d.studentid || filters.studentid,
    teacherid: d.teacherid,
    moduleid: d["module.id"],
  }));
  return data as ReportListItem[];
}

export async function fetchReports(trx: Transaction, filters: ReportFilters) {
  const reports = await getReports(filters);
  const userids: number[] = _.chain(reports)
    .map((r: any) => [r.studentid, r.teacherid])
    .flatten()
    .uniq()
    .value();
  const moduleids: number[] = _.chain(reports)
    .map((r: any) => r.moduleid)
    .uniq()
    .value();
  const [users, modules] = await Promise.all([
    fetchUsers(trx, userids),
    fetchModules(trx, moduleids)
  ]);
  for (const r of reports) {
    r.student = _.find(users, u => u.id === r.studentid);
    r.teacher = _.find(users, u => u.id === r.teacherid);
    r.module = _.find(modules, u => u.id === r.moduleid);
  }
  return reports;
}

export async function updateComments(reportid: string, report: Report, generalComment: string, goalComments: GoalComment[]) {
  report.generalComment = generalComment;
  report.goalComments = goalComments;
  await datastore.update({
    key: getKey(reportid),
    data: report
  });
}