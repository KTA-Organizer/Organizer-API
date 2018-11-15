import { Transaction } from "knex";
import { EvaluationSheet } from "../models/EvaluationSheet";
import { fetchUser } from "./users";
import { fetchFullModule } from "./modules";


function rowToEvaluationSheet(row: any) {
    return row as EvaluationSheet;
}

async function rowToFullEvaluationSheet(trx: Transaction, row: any) {
    const sheet = rowToEvaluationSheet(row);
    const [student, teacher] = await Promise.all([
        fetchUser(trx, sheet.studentid),
        fetchUser(trx, sheet.teacherid)
    ]);
    sheet.student = student;
    sheet.teacher = teacher;
    sheet.scores = await fetchScoresForEvaluationSheet(trx, sheet.id);
    sheet.module = await fetchFullModule(trx, sheet.moduleid);
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
    const row = await trx.table("evaluationsheets").where("id", id).first();
    return await rowToFullEvaluationSheet(trx, row);
}

export async function fetchScoresForEvaluationSheet(trx: Transaction, evaluationsheetid: number) {
    return await trx.table("scores")
        .where({ evaluationsheetid })
        .orderBy("scores.creation", "asc");
}

export async function insertEvaluationSheet(trx: Transaction, data: { moduleid: number, studentid: number, teacherid: number, startdate: Date }) {
    const [id] = await trx.table("evaluationsheets").insert(data);
    return id as number;
}

export async function insertScores(trx: Transaction, evaluationsheetid: number, evaluations: any[]) {
    const rows = evaluations.map(ev => Object.assign(ev, { evaluationsheetid }));
    await trx.table("scores").insert(rows);
}