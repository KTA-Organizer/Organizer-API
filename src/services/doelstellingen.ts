import { Doelstelling } from "../models/Doelstelling";
import * as evaluatieCriteriaService from "./evaluatieCriteria";
import { Transaction } from "knex";

async function rowToDoelstelling(row: any) {
    /*if (row.creatorId) {
        row.creator = await usersService.fetchUser(row.creatorId);
    }*/
    return await row as Doelstelling;
}

export async function fetchAllDoelstellingen(trx: Transaction) {
  const rows = await trx.table("doelstellingen")
    .select("*")
    .map(rowToDoelstelling);
  if (rows.length < 1) return;
  return await rows;
}

export async function fetchDoelstelling(trx: Transaction, id: number) {
  const rows = await trx.table("doelstellingen")
    .select("*")
    .where({ id });
  if (rows.length < 1) return;
  return await rowToDoelstelling(rows[0]);
}

async function rowsToFullDoelstelling(trx: Transaction, rows: any[]) {
  const doelstellingen = rows as Doelstelling[];
  const doelstellingenIds = doelstellingen.map(d => d.id);
  const evaluatieCriterias = await evaluatieCriteriaService
    .fetchEvaluatieCriteriaForDoelstellingen(trx, doelstellingenIds);

  for (const doel of doelstellingen) {
    doel.evaluatieCriteria = evaluatieCriterias
      .filter(ec => ec.doelstellingId === doel.id);
  }
  return doelstellingen;
}

export async function fetchDoelstellingenForCategories(trx: Transaction, categorieIds: number[]) {
  const rows = await trx.table("doelstellingen")
    .select("*")
    .whereIn("doelstellingscategorieId", categorieIds);
  return rowsToFullDoelstelling(trx, rows);
}

export async function insertDoelstelling(trx: Transaction, data: { doelstellingscategorieId: number, name: string, inGebruik: number,  creatorId: number }) {
    return await trx.table("doelstellingen").insert( data );
}

export async function updateDoelstelling(trx: Transaction, data: { id: number, name: string}) {
    await trx.table("doelstellingen").where("id", data.id).update( data );
}

export async function removeDoelstelling(trx: Transaction, id: number) {
    await trx.table("doelstellingen").where("id", id).del();
}
