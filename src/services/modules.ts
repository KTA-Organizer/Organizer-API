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

function rowToModule(row: any): Module {
  if (row.teacherId) {
    row.teacher = teachersService.fetchTeacher(row.teacherId);
  }
  if (row.creatorId) {
    row.creator = usersService.fetchUser(row.creatorId);
  }
  if (row.opleidingId) {
    row.opleiding = opleidingenService.fetchOpleiding(row.opleidingId);
  }
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

async function rowToModules(rows: Module[]) {
  for (const mod of rows) {
    mod.doelstellingCategories = await doelstellingCategoryService.fetchDoelstellingsCategoryForModule(mod.id) as DoelstellingsCategorie[];
  }
  return await rows as Module[];
}

export async function fetchModulesForOpleiding(id: number) {
  const rows = await knex("modules")
    .select("*")
    .where({ opleidingId: id });
  return await rowToModules(rows as Module[]);
}
