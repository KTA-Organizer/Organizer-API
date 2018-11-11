import logger from "../util/logger";
import { Module } from "../models/Module";
import { Transaction } from "knex";
import * as domainsService from "./domains";

function rowToModule(row: any) {
  if (!row) return;
  return row as Module;
}

export async function fetchModule(trx: Transaction, id: number) {
  const row = await trx.table("modules")
    .where({ id })
    .first();
  return rowToModule(row);
}

export async function fetchModules(trx: Transaction, ids: number[]) {
  const rows = await trx.table("modules")
    .whereIn("id", ids);
  return rows.map(rowToModule);
}

export async function fetchFullModule(trx: Transaction, id: number) {
  const row = await trx.table("modules")
    .select("*")
    .where("id", id)
    .first();
  return rowToFullModule(trx, row);
}

async function rowToFullModule(trx: Transaction, row: any) {
  const module = rowToModule(row);
  module.domains = await domainsService.fetchDomainsForModule(trx, module.id);
  return module;
}

export async function fetchModulesForDiscipline(trx: Transaction, disciplineid: number) {
  const rows: any[] = await trx.table("modules")
    .select("*")
    .where({ disciplineid });
  return rows.map(rowToModule);
}

export async function insertModule(trx: Transaction, data: { disciplineid: number, name: string, creatorId: number }) {
    return await trx.table("modules").insert( data );
}

export async function updateModule(trx: Transaction, id: number, data: { name: string }) {
    await trx.table("modules").where("id", id).update( data );
}

export async function updateModuleStatus(trx: Transaction, id: number, data: { active: number }) {
  await trx.table("modules").where("id", id).update( data );
}

export async function deactivateModule(trx: Transaction, id: number) {
    await trx.table("modules").where("id", id).update({ active: 0 });
}