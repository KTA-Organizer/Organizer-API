import logger from "../util/logger";
import { Discipline } from "../models/Discipline";
import * as usersService from "./users";
import * as moduleService from "./modules";
import { Transaction } from "knex";

function rowToDiscipline(row: any) {
  if (!row) return;
  return row as Discipline;
}

async function rowToFullDiscipline(trx: Transaction, row: Discipline) {
  if (!row) return;
  const discipline = rowToDiscipline(row);
  if (discipline.creatorId) {
    discipline.creator = await usersService.fetchUser(trx, row.creatorId);
  }
  discipline.modules = await moduleService.fetchModulesForDiscipline(trx, row.id);
  return discipline;
}

export async function fetchAllDisciplines(trx: Transaction) {
  const rows = await trx.table("disciplines").select("*");
  return rows.map(rowToDiscipline);
}

export async function fetchDisciplines(trx: Transaction, ids: number[]): Promise<Discipline[]> {
  const rows = await trx.table("disciplines").select("*").whereIn("id", ids);
  return rows.map(rowToDiscipline);
}

export async function fetchDiscipline(trx: Transaction, id: number) {
  const discipline_rows = await trx.table("disciplines").where("id", id).first();
  return rowToDiscipline(discipline_rows);
}

export async function fetchFullDiscipline(trx: Transaction, id: number) {
  const discipline_rows = await trx.table("disciplines").where("id", id).first();
  return await rowToFullDiscipline(trx, discipline_rows);
}

export async function insertDiscipline(trx: Transaction, data: {name: string, creatorId: number}) {
   return await trx.table("disciplines").insert({ ...data, active: 1 });
}

export async function updateDiscipline(trx: Transaction, id: number, data: {name: string}) {
    await trx.table("disciplines").where("id", id).update( data );
}

export async function deactivateDiscipline(trx: Transaction, id: number) {
    await trx.table("disciplines").where("id", id).update({ active: 0 });
}
