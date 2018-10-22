import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();
import { StudentModule } from "../models/StudentModule";
import * as opleidingenService from "../services/opleidingen";

async function rowToStudentModule(row: any) {
  if (row.opleidingId) {
    row.opleiding = await opleidingenService.fetchOpleiding(row.opleidingId);
  }
  return row as StudentModule;
}

export async function fetchAllStudentModules() {
  const rows = await knex("studenten_modules")
    .select("*")
    .map(rowToStudentModule);
  if (rows.length < 1) return;
  return rows;
}

export async function fetchStudentModulesWithStudentId(id: number) {
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
  await knex("studenten_modules").insert({ ...data, status: "Volgt" });
}

export async function removeStudentModule(id: number) {
  await knex("studenten_modules")
    .where({ studentId: id })
    .del();
}
