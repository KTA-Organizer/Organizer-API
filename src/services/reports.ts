import { Transaction, QueryBuilder } from "knex";
import { Report, ReportListItem, GoalComment } from "../models/Report";
import { datastore } from "../config/datastore";
import _ from "lodash";
import { convertNestedFields, addFilters } from "../util/knexHelpers";
import { fetchEvaluationSheet, calculateEvaluationSheetAggregateScores } from "./evaluation";
import { paginate, PaginateResult } from "../config/db";
import { loadConfig } from "../config/storage";
import { sendMail } from "../config/mail";

export async function generateReport(trx: Transaction, evaluationsheetid: number) {
  const evaluationSheet = await fetchEvaluationSheet(trx, evaluationsheetid);
  const goalAggregateScores = calculateEvaluationSheetAggregateScores(evaluationSheet);
  const goalComments = goalAggregateScores.map(ga => ({
    goalid: ga.goalid,
    comment: "",
  }));

  const report: Report = {
    open: false,
    evaluationsheetid,
    evaluationSheet,
    creation: new Date(),
    goalAggregateScores,
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
    evaluationsheetid: report.evaluationsheetid,
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

export async function fetchReportListItem(trx: Transaction, reportid: string) {
  const report = await trx.table("reports").where("id", reportid).first();
  return report as ReportListItem;
}

export async function fetchReportIdForEvaluationsheet(trx: Transaction, evaluationsheetid: number) {
  const report = await trx.table("reports").where("evaluationsheetid", evaluationsheetid).first();
  return report && report.id;
}

export async function fetchReport(trx: Transaction, reportid: string) {
  const reportListItem = await fetchReportListItem(trx, reportid);
  const [report]: any = await datastore.get(getKey(reportid));
  return ({...report, ...reportListItem}) as Report;
}


export type FetchReportsOptions = {
  page: number,
  perPage: number,
  studentid?: number,
  teacherid?: number,
  moduleid?: number,
  disciplineid?: number,
};

export async function paginateAllReports(trx: Transaction, { page, perPage, ...filters }: FetchReportsOptions) {
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
    .innerJoin("evaluationsheets", "evaluationsheets.id", "reports.evaluationsheetid")
    .innerJoin("modules", "modules.id", "evaluationsheets.moduleid")
    .innerJoin("disciplines", "disciplines.id", "modules.disciplineid")
    .innerJoin("users as student", "student.id", "evaluationsheets.studentid")
    .innerJoin("users as teacher", "teacher.id", "evaluationsheets.teacherid")
    .orderBy("reports.creation", "DESC");

  addFilters(query, filters);

  const paginator: PaginateResult<ReportListItem> = await paginate(query)(page, perPage);
  paginator.items = convertNestedFields(paginator.items);
  return paginator;
}

export async function updateComments(reportid: string, report: Report, generalComment: string, goalComments: GoalComment[]) {
  report.generalComment = generalComment;
  report.goalComments = goalComments;
  await datastore.update({
    key: getKey(reportid),
    data: report
  });
}

export async function openReport(trx: Transaction, reportid: string) {
  await trx.table("reports").update({open: true}).where("id", reportid);
  const report = await fetchReport(trx, reportid);
  await sendResetMail(report.evaluationSheet.student.email, reportid);
}

async function getReportLink(reportid: string) {
  const config = await loadConfig();
  return `${config.url}/#/rapport/${reportid}`;
}

async function sendResetMail(to: string, reportid: string) {
  const html = `
U heeft een nieuw rapport ontvangen!
<a href=${await getReportLink(reportid)}>Rapport openen</a>
  `;

  await sendMail({
    to,
    subject: "Nieuw rapport",
    html
  });
}