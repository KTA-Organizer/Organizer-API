import logger from "../util/logger";
import { Opleiding } from "../models/Opleiding";
import * as usersService from "../services/users";
import * as moduleService from "../services/modules";
import { Transaction } from "knex";

async function rowToOpleiding(trx: Transaction, row: any) {
  if (row.creatorId) {
    row.creator = await usersService.fetchUser(trx, row.creatorId);
  }
  return row as Opleiding;
}

export async function fetchAllOpleidingen(trx: Transaction) {
  const rows = (await trx.table("opleidingen").select("*")).map((row: any) => rowToOpleiding(trx, row));
  const opleidingenPromises = await Promise.all(rows);
  return opleidingenPromises;
}

export async function fetchOpleiding(trx: Transaction, id: number) {
  const opleiding_rows = await trx.table("opleidingen").where("id", id);
  if (opleiding_rows.length < 1) return;
  return await rowToOpleiding(trx, opleiding_rows[0]);
}

async function rowToFullOpleiding(trx: Transaction, row: Opleiding) {
  const opleiding: Opleiding = await rowToOpleiding(trx, row);
  opleiding.modules = await moduleService.fetchModulesForOpleiding(trx, row.id);
  return row;
}

export async function fetchFullOpleiding(trx: Transaction, id: number) {
  const opleiding_rows = await trx.table("opleidingen").where("id", id);
  if (opleiding_rows.length < 1) return;
  return await rowToFullOpleiding(trx, opleiding_rows[0]);
}

export async function fetchOpleidingForStudent(trx: Transaction, id: number) {
  const opleiding_id = await trx.table("studenten_modules")
    .select("opleidingId")
    .where({ studentId: id });
  if (opleiding_id.length >= 1) {
    const opleiding = await fetchOpleiding(trx, opleiding_id[0].opleidingId);
    return opleiding;
  }
  return undefined;
}
