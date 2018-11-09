import { Transaction } from "knex";

export async function createReportForUser(trx: Transaction, studentid: number, moduleid: number) {
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