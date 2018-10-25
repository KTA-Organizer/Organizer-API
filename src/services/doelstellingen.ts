import { getKnex } from "../config/db";
import { Doelstelling } from "../models/Doelstelling";
import * as evaluatieCriteriaService from "./evaluatieCriteria";

async function rowToDoelstelling(row: any) {
    /*if (row.creatorId) {
        row.creator = await usersService.fetchUser(row.creatorId);
    }*/
    return await row as Doelstelling;
}

export async function fetchAllDoelstellingen() {
  const knex = await getKnex();
  const rows = await knex("doelstellingen")
    .select("*")
    .map(rowToDoelstelling);
  if (rows.length < 1) return;
  return await rows;
}

export async function fetchDoelstelling(id: number) {
  const knex = await getKnex();
  const rows = await knex("doelstellingen")
    .select("*")
    .where({ id });
  if (rows.length < 1) return;
  return await rowToDoelstelling(rows[0]);
}

async function rowsToFullDoelstelling(rows: any[]) {
  const doelstellingen = rows as Doelstelling[];
  const doelstellingenIds = doelstellingen.map(d => d.id);
  const evaluatieCriterias = await evaluatieCriteriaService
    .fetchEvaluatieCriteriaForDoelstellingen(doelstellingenIds);

  for (const doel of doelstellingen) {
    doel.evaluatieCriteria = evaluatieCriterias
      .filter(ec => ec.doelstellingId === doel.id);
  }
  return doelstellingen;
}

export async function fetchDoelstellingenForCategories(categorieIds: number[]) {
  const knex = await getKnex();
  const rows = await knex("doelstellingen")
    .select("*")
    .whereIn("doelstellingscategorieId", categorieIds);
  return rowsToFullDoelstelling(rows);
}

export async function insertDoelstelling(data: { doelstellingscategorieId: number, name: string, inGebruik: number,  creatorId: number }) {
    const knex = await getKnex();
    await knex("doelstellingen").insert( data );
}

export async function updateDoelstelling(data: { id: number, doelstellingscategorieId: number, name: string, inGebruik: number, creatorId: number }) {
    const knex = await getKnex();
    await knex("doelstellingen").where("id", data.id).update( data );
}

export async function removeDoelstelling(id: number) {
    const knex = await getKnex();
    await knex("doelstellingen").where("id", id).del();
}
