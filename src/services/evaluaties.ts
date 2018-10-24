import logger from "../util/logger";
import { getKnex } from "../config/db";
import { Evaluatie } from "../models/Evaluatie";
import * as studentenService from "../services/studenten";
import * as modulesService from "../services/modules";

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

export async function fetchAllEvaluaties() {
  const knex = await getKnex();
  const rows = await knex("evaluaties")
    .select("*")
    .map(rowToEvaluatie);
  if (rows.length < 1) return;
  return await rows;
}

export async function fetchEvaluatie(id: number) {
  const knex = await getKnex();
  const rows = await knex("evaluaties")
    .select("*")
    .where({ id });
  if (rows.length < 1) return;
  return await rowToEvaluatie(rows[0]);
}

export async function fetchEvaluatiesForStudent(id: number) {
  const knex = await getKnex();
  const rows = await knex("evaluaties")
    .select("*")
    .where({ studentId: id });
  return rows as Evaluatie[];
}
