import { Aspect } from "../models/Aspect";
import { Transaction } from "knex";

export async function fetchAspectenForEvaluatieCriteria(trx: Transaction, criteriaIds: number[]) {
    const rows = await trx.table("aspecten")
        .select("*")
        .whereIn("evaluatiecriteriumId", criteriaIds);
    return rows as Aspect[];
}

export async function fetchAllAspecten(trx: Transaction)  {
    const rows = await trx.table("aspecten")
        .select("*");
    if (rows.length < 1)
        return;
    return await rows;
}

export async function fetchAspect(trx: Transaction, id: number)  {
    const row = await trx.table("aspecten")
        .select("*")
        .where("id", id);
    if (row.length < 1)
        return;
    return await row;
}

export async function insertAspect(trx: Transaction, data: { evaluatiecriteriumId: number, name: string, inGebruik: number, gewicht: number, creatorId: number }) {
    await trx.table("aspecten").insert( data );
}

export async function updateAspect(trx: Transaction, data: { id: number, name: string}) {
    await trx.table("aspecten").where("id", data.id).update( data );
}

export async function deleteAspect(trx: Transaction, id: number) {
    await trx.table("aspecten").where("id", id).del();
}
