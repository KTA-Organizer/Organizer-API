import logger from "../util/logger";
import * as disciplinesService from "./disciplines";
import { Transaction } from "knex";

export async function fetchStudentDiscipline(
  trx: Transaction,
  studentid: number
) {
  const row = await trx
    .table("student_disciplines")
    .select("*")
    .where("studentid", studentid)
    .first();
  if (!row) return;
  return await disciplinesService.fetchDiscipline(trx, row.disciplineid);
}
export async function addStudentToDiscipline(
  trx: Transaction,
  data: {
    studentid: number;
    disciplineid: number;
  }
) {
  await trx.table("student_disciplines").insert(data);
}

export async function removeStudentFromDiscipline(
  trx: Transaction,
  studentid: number
) {
  await trx
    .table("student_disciplines")
    .where("studentId", studentid)
    .del();
}
