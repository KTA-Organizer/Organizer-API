import { Evaluatie } from "../models/Evaluatie";
import { Transaction } from "knex";

async function rowToEvaluatie(row: any) {
  // In comments because we don't know yet if we need this
  /*if (row.studentId) {
        row.student = await studentenService.fetchStudent(row.studentId);
    }
    if (row.moduleId) {
        row.module = await modulesService.fetchModule(row.moduleId);
    }*/
  return (await row) as Evaluatie;
}

export async function fetchAllEvaluaties(trx: Transaction) {
  const rows = await trx.table("evaluaties")
    .select("*")
    .map(rowToEvaluatie);
  if (rows.length < 1) return;
  return await rows;
}

export async function fetchEvaluatie(trx: Transaction, id: number) {
  const rows = await trx.table("evaluaties")
    .select("*")
    .where({ id });
  if (rows.length < 1) return;
  return await rowToEvaluatie(rows[0]);
}

export async function fetchEvaluatiesForStudent(trx: Transaction, id: number) {
  const rows = await trx.table("evaluaties")
    .select("*")
    .where({ studentId: id });
  return rows as Evaluatie[];
}
