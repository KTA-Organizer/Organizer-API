import { Transaction } from "knex";
import { EvaluationSheet } from "../models/EvaluationSheet";
import { fetchUser } from "./users";
import { fetchFullModule } from "./modules";
import _ from "lodash";
import { GoalAggregateScore } from "../models/GoalScore";
import { fetchDiscipline } from "./disciplines";

function rowToEvaluationSheet(row: any) {
  return row as EvaluationSheet;
}

async function rowToFullEvaluationSheet(trx: Transaction, row: any) {
    const sheet = rowToEvaluationSheet(row);
    if (!row) {
        return sheet;
    }
    const [student, teacher, scores, module] = await Promise.all([
        fetchUser(trx, sheet.studentid),
        fetchUser(trx, sheet.teacherid),
        fetchScoresForEvaluationSheet(trx, sheet.id),
        fetchFullModule(trx, sheet.moduleid)
    ]);
    sheet.student = student;
    sheet.teacher = teacher;
    sheet.scores = scores;
    sheet.module = module;
    sheet.discipline = await fetchDiscipline(trx, module.disciplineid);
    return sheet;
}

export async function fetchEvaluationSheets(trx: Transaction, options: { studentid: number, moduleid: number }) {
    const query = trx.table("evaluationsheets");
    if (options.studentid) {
        query.where("studentid", options.studentid);
    }
    if (options.moduleid) {
        query.where("moduleid", options.moduleid);
    }
    const rows = await query;
    return rows.map(rowToEvaluationSheet);
}

export async function fetchEvaluationSheet(trx: Transaction, id: number) {
  const row = await trx
    .table("evaluationsheets")
    .where("id", id)
    .first();
  return await rowToFullEvaluationSheet(trx, row);
}

export async function fetchScoresForEvaluationSheet(
  trx: Transaction,
  evaluationsheetid: number
) {
  return await trx
    .select("name", "grade", "criteriaid")
    .table("scores")
    .where({ evaluationsheetid })
    .orderBy("scores.creation", "asc");
}

export async function insertEvaluationSheet(
  trx: Transaction,
  data: {
    moduleid: number;
    studentid: number;
    teacherid: number;
    startdate: Date;
  }
) {
  const [id] = await trx.table("evaluationsheets").insert(data);
  return id as number;
}

export function calculateEvaluationSheetAggregateScores(evaluationSheet: EvaluationSheet) {
  const criteriaScores = _.groupBy(evaluationSheet.scores, "criteriaid");

  const criteriaAggregates = Object.keys(criteriaScores).reduce((agg, criteriaid) => {
    const grades = criteriaScores[criteriaid].map(s => s.grade);
    return ({
      ...agg,
      [criteriaid]: _.sum(grades) / grades.length
    });
  }, {} as any);

  const goalAggregates: GoalAggregateScore[] = _.chain(evaluationSheet.module.domains)
    .flatMap(dom => dom.goals)
    .map(goal => {
        const goalAvg = _.chain(goal.criteria)
            .map(crit => criteriaAggregates[crit.id] * crit.weight)
            .filter(avg => avg)
            .sum()
            .value();
        const quotient = _.chain(goal.criteria).map(crit => crit.weight).sum().value();
        return { goalid: goal.id, grade: goalAvg / quotient };
    })
    .filter(score => score.grade)
    .value() as any;

  return goalAggregates;
}

export async function insertScores(
  trx: Transaction,
  evaluationsheetid: number,
  creatorid: number,
  evaluations: any[]
) {
  const rows = evaluations.map(ev =>
    Object.assign(ev, { evaluationsheetid, creatorid })
  );
  await trx
    .table("scores")
    .where({ evaluationsheetid })
    .delete();
  await trx.table("scores").insert(rows);
}

export async function endEvaluation(
  trx: Transaction,
  evaluationsheetid: number
) {
  await trx
    .table("evaluationsheets")
    .where({ id: evaluationsheetid })
    .update({ enddate: new Date() });
}
