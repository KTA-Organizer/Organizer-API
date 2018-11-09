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
    return await trx.table("scores").select("*").where({ id });
}

export async function fetchEvaluationsForStudent(trx: Transaction, id: number) {
    return await trx.table("scores").select("*").where({ studentid: id });
}

export async function fetchEvaluationsForMolule(trx: Transaction, id: number) {
    console.log("moduleid-->", id);
    return await trx.table("scores")
        .select("scores.*", "modules.id as moduleid", "modules.name as modulename")
        .leftJoin("criteria", "scores.criteriaid", "criteria.id")
        .leftJoin("goals", "goals.id", "criteria.goalid")
        .leftJoin("domains", "domains.id", "goals.domainid")
        .leftJoin("modules", "modules.id", "domains.moduleid")
        .where({ "modules.id": id })
        .orderBy("scores.creation", "asc");
}

export async function fetchEvaluationsForStudentForModule(trx: Transaction, studentid: number, moduleid: number) {
    return await trx.table("scores")
        .select("scores.*", "modules.id as moduleid", "modules.name as modulename")
        .leftJoin("criteria", "scores.criteriaid", "criteria.id")
        .leftJoin("goals", "goals.id", "criteria.goalid")
        .leftJoin("domains", "domains.id", "goals.domainid")
        .leftJoin("modules", "modules.id", "domains.moduleid")
        .where({ "modules.id": moduleid, "studentid": studentid })
        .orderBy("scores.creation", "asc");
}

export async function insertEvaluations(trx: Transaction, evaluations: any[]) {
    await trx.table("scores").insert(evaluations);
}