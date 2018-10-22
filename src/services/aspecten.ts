import getKnexInstance from "../config/db";
import { Aspect } from "../models/Aspect";
import * as usersService from "./users";
import * as studentmodulesService from "./studentmodules";
import * as studentInviteService from "./studentInvite";
const knex = getKnexInstance();

export async function fetchAspectenForEvaluatieCriteria(criteriaIds: number[]) {
  const rows = await knex("aspecten")
    .select("*")
    .whereIn("evaluatiecriteriumId", criteriaIds);
  return rows as Aspect[];
}

export async function fetchAllAspecten()  {
    const rows = await knex("aspecten")
        .select("*");
    if (rows.length < 1)
        return;
    return await rows;
}

export async function fetchAspect(id: number)  {
    const row = await knex("aspecten")
        .select("*")
        .where("id", id);
    if (row.length < 1)
        return;
    return await row;
}

export async function insertAspect(data: { evaluatiecriteriumId: number, name: string, inGebruik: number, gewicht: number, creatorId: number }) {
    await knex("aspecten").insert( data );
}

export async function updateAspect(data: { id: number, evaluatiecriteriumId: number, name: string, inGebruik: number, gewicht: number, creatorId: number }) {
    await knex("aspecten").where("id", data.id).update( data );
}

export async function deleteAspect(id: number) {
    await knex("aspecten").where("id", id).del();
}
