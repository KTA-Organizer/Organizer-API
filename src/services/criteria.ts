import { Criterion } from "../models/Criterion";
import { Transaction } from "knex";

function rowToCriterion(row: any) {
  if (!row) return;
  return row as Criterion;
}

export async function fetchCriteria(trx: Transaction, id: number) {
  const row = await trx.table("criteria")
    .where("id", id)
    .first();
  return rowToCriterion(row);
}

export async function fetchCriteriaForGoals(trx: Transaction, goalIds: number[]) {
  const rows: any[] = await trx.table("criteria")
    .select("*")
    .whereIn("goalid", goalIds);
  return rows.map(rowToCriterion);
}

export async function insertCriterion(trx: Transaction, data: { name: string, goalid: number, weight: number, creatorId: number }) {
  const [id] = await trx.table("criteria").insert(data);
  return await fetchCriteria(trx, id);
}

export async function updateCriterion(trx: Transaction, id: number, data: { name: string, weight: number }) {
  await trx.table("criteria").where("id", id).update(data);
}

export async function updateCriterionStatus(trx: Transaction, id: number, data: { active: number }) {
  await trx.table("criteria").where("id", id).update(data);
}