import logger from "../util/logger";
import { Module } from "../models/Module";
import * as doelstellingCategoryService from "../services/doelstellingsCategories";
import { Transaction } from "knex";

async function rowToModule(row: any) {
  /*if (row.teacherId) {
        row.teacher = await teachersService.fetchTeacher(row.teacherId);
    }
    if (row.creatorId) {
        row.creator = await usersService.fetchUser(row.creatorId);
    }*/
  return row as Module;
}

export async function fetchAllModules(trx: Transaction) {
  const rows = await trx.table("modules")
    .select("*")
    .map(rowToModule);
  if (rows.length < 1) return;
  return rows;
}

export async function fetchModule(trx: Transaction, id: number) {
  const rows = await trx.table("modules")
    .select("*")
    .where({ id });
  if (rows.length < 1) return;
  return rowToModule(rows[0]);
}

async function rowsToModules(trx: Transaction, rows: any) {
  const modules = rows as Module[];
  const moduleIds = modules.map(m => m.id);

  const allDoelstellingCategories = await doelstellingCategoryService.fetchDoelstellingsCategoryForModules(trx, moduleIds);

  for (const module of modules) {
    module.doelstellingCategories = allDoelstellingCategories
      .filter(dc => dc.moduleId == module.id);
  }

  return rows as Module[];
}

export async function fetchModulesForOpleiding(trx: Transaction, id: number) {
  const rows = await trx.table("modules")
    .select("*")
    .where({ opleidingId: id });
  return await rowsToModules(trx, rows);
}

export async function fetchModulesForStudent(trx: Transaction, studId: number) {
  const rows = await trx.table("studenten_modules")
    .select("moduleId")
    .where({ studentId: studId });
  const module_ids = rows.map((x: any) => x.moduleId);
  const modules = await trx.table("modules")
    .select("*")
    .whereIn("id", module_ids);
  return modules as Module[];
}

export async function insertModule(trx: Transaction, data: { opleidingId: number, teacherId: number, name: string, creatorId: number }) {
    await trx.table("modules").insert( data );
}

export async function updateModule(trx: Transaction, data: { id: number, name: string }) {
    await trx.table("modules").where("id", data.id).update( data );
}

export async function removeModule(trx: Transaction, id: number) {
    await trx.table("modules").where("id", id).del();
}