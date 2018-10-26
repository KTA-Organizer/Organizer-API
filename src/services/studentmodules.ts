import logger from "../util/logger";
import { StudentModule } from "../models/StudentModule";
import * as opleidingenService from "../services/opleidingen";
import { Transaction } from "knex";

async function rowToStudentModule(trx: Transaction, row: any) {
  if (row.opleidingId) {
    row.opleiding = await opleidingenService.fetchOpleiding(trx, row.opleidingId);
  }
  return row as StudentModule;
}

export async function fetchAllStudentModules(trx: Transaction) {
  const rows = await trx.table("studenten_modules")
    .select("*")
    .map(row => rowToStudentModule(trx, row));
  if (rows.length < 1) return;
  return rows;
}

export async function fetchStudentModulesWithStudentId(trx: Transaction, id: number) {
  const rows = await trx.table("studenten_modules")
    .select("*")
    .where({ studentId: id })
    // tslint:disable
    .whereNot("opleidingId", null)
    .map(row => rowToStudentModule(trx, row));
  if (rows.length < 1) return;
  return rows[0];
}

export async function insertStudentModule(trx: Transaction, data: {
  studentId: number;
  moduleId: number;
  opleidingId: number;
}) {
  await trx.table("studenten_modules").insert({ ...data, status: "Volgt" });
}

export async function removeStudentModules(trx: Transaction, id: number) {
  const modules = await trx.table("studenten_modules")
    .select("*")
    .where({ studentId: id });
  if (modules.length > 0) {
    await trx.table("studenten_modules")
      .where({ studentId: id })
      .del();
  }
}
