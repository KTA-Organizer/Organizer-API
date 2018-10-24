import logger from "../util/logger";
import { getKnex } from "../config/db";
import { StudentModule } from "../models/StudentModule";
import * as opleidingenService from "../services/opleidingen";

async function rowToStudentModule(row: any) {
  if (row.opleidingId) {
    row.opleiding = await opleidingenService.fetchOpleiding(row.opleidingId);
  }
  return row as StudentModule;
}

export async function fetchAllStudentModules() {
  const knex = await getKnex();
  const rows = await knex("studenten_modules")
    .select("*")
    .map(rowToStudentModule);
  if (rows.length < 1) return;
  return rows;
}

export async function fetchStudentModulesWithStudentId(id: number) {
  const knex = await getKnex();
  const rows = await knex("studenten_modules")
    .select("*")
    .where({ studentId: id })
    // tslint:disable
    .whereNot("opleidingId", null)
    .map(rowToStudentModule);
  if (rows.length < 1) return;
  return rows[0];
}

export async function insertStudentModule(data: {
  studentId: number;
  moduleId: number;
  opleidingId: number;
}) {
  const knex = await getKnex();
  await knex("studenten_modules").insert({ ...data, status: "Volgt" });
}

export async function removeStudentModule(id: number) {
  const knex = await getKnex();
  const modules = await knex("studenten_modules")
    .select("*")
    .where({ studentId: id });
  if (modules.length > 0) {
    await knex("studenten_modules")
      .where({ studentId: id })
      .del();
  }
}
