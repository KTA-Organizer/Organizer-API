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
    const rows = await knex("meldingen")
        .select("*");
    if (rows.length < 1)
        return;
    return await rows;
}

export async function insertAspect(data: { evaluatiecriteriumId: number, name: string, inGebruik: number, gewicht: number, creatorId: number }) {
    await knex("aspecten").insert( data );
}
