import { getKnex } from "../config/db";
import { Aspect } from "../models/Aspect";

export async function fetchAspectenForEvaluatieCriteria(criteriaIds: number[]) {
    const knex = await getKnex();
    const rows = await knex("aspecten")
        .select("*")
        .whereIn("evaluatiecriteriumId", criteriaIds);
    return rows as Aspect[];
}

export async function fetchAllAspecten()  {
    const knex = await getKnex();
    const rows = await knex("aspecten")
        .select("*");
    if (rows.length < 1)
        return;
    return await rows;
}

export async function fetchAspect(id: number)  {
    const knex = await getKnex();
    const row = await knex("aspecten")
        .select("*")
        .where("id", id);
    if (row.length < 1)
        return;
    return await row;
}

export async function insertAspect(data: { evaluatiecriteriumId: number, name: string, inGebruik: number, gewicht: number, creatorId: number }) {
    const knex = await getKnex();
    await knex("aspecten").insert( data );
}

export async function updateAspect(data: { id: number, evaluatiecriteriumId: number, name: string, inGebruik: number, gewicht: number, creatorId: number }) {
    const knex = await getKnex();
    await knex("aspecten").where("id", data.id).update( data );
}

export async function deleteAspect(id: number) {
    const knex = await getKnex();
    await knex("aspecten").where("id", id).del();
}
