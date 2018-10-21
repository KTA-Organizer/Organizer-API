import logger from "../util/logger";
import getKnexInstance from "../config/db";
const knex = getKnexInstance();
import { Doelstelling } from "../models/Doelstelling";
import * as usersService from "../services/users";
import * as doelstellingsCategoriesService from "../services/doelstellingsCategories";
import * as evaluatieCriteriaService from "./evaluatieCriteria";

async function rowToDoelstelling(row: any) {
    /*if (row.creatorId) {
        row.creator = await usersService.fetchUser(row.creatorId);
    }*/
    return await row as Doelstelling;
}

export async function fetchAllDoelstellingen() {
  const rows = await knex("doelstellingen")
    .select("*")
    .map(rowToDoelstelling);
  if (rows.length < 1) return;
  return await rows;
}

export async function fetchDoelstelling(id: number) {
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
  const rows = await knex("doelstellingen")
    .select("*")
    .whereIn("doelstellingscategorieId", categorieIds);
  return rowsToFullDoelstelling(rows);
}
