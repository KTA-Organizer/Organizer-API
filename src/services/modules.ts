import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();
import { Module } from "../models/Module";
import * as teachersService from "../services/teachers";
import * as opleidingenService from "../services/opleidingen";
import * as usersService from "../services/users";
import * as doelstellingService from "../services/doelstellingen";
import * as doelstellingCategoryService from "../services/doelstellingsCategories";
import { DoelstellingsCategorie } from "../models/DoelstellingsCategorie";

async function rowToModule(row: any) {
  /*if (row.teacherId) {
        row.teacher = await teachersService.fetchTeacher(row.teacherId);
    }
    if (row.creatorId) {
        row.creator = await usersService.fetchUser(row.creatorId);
    }*/
  return row as Module;
}

export async function fetchAllModules() {
  const rows = await knex("modules")
    .select("*")
    .map(rowToModule);
  if (rows.length < 1) return;
  return rows;
}

export async function fetchModule(id: number) {
  const rows = await knex("modules")
    .select("*")
    .where({ id });
  if (rows.length < 1) return;
  return rowToModule(rows[0]);
}

async function rowsToModules(rows: any) {
  const modules = rows as Module[];
  const moduleIds = modules.map(m => m.id);

  const allDoelstellingCategories = await doelstellingCategoryService.fetchDoelstellingsCategoryForModules(moduleIds);

  for (const module of modules) {
    module.doelstellingCategories = allDoelstellingCategories
      .filter(dc => dc.moduleId == module.id);
  }

  return rows as Module[];
}

export async function fetchModulesForOpleiding(id: number) {
  const rows = await knex("modules")
    .select("*")
    .where({ opleidingId: id });
  return await rowsToModules(rows);
}

export async function fetchModulesForStudent(studId: number) {
  const rows = await knex("studenten_modules")
    .select("moduleId")
    .where({ studentId: studId });
  const module_ids = rows.map((x: any) => x.moduleId);
  const modules = await knex("modules")
    .select("*")
    .whereIn("id", module_ids);
  return modules as Module[];
}
