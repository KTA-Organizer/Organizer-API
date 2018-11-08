import { Transaction } from "knex";
import { text } from "body-parser";
import { Score } from "../models/Score";


function asScores(rows: any[]) {
    return rows as Score[];
}

export async function fetchEvaluations(trx: Transaction) {
    const rows = await trx.table("scores").select("*");
    return asScores(rows);
}

export async function fetchEvaluation(trx: Transaction, id: number) {
    return trx.table("scores").select("*").where({id});
}