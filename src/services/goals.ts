import { Goal } from "../models/Goal";
import * as criteriaService from "./criteria";
import { Transaction } from "knex";

function rowToGoal(row: any) {
  if (!row) return;
  return row as Goal;
}

async function rowsToFullGoals(trx: Transaction, rows: any[]) {
  const goals = rows.map(rowToGoal);
  const ids = goals.map(g => g.id);
  const criteria = await criteriaService.fetchCriteriaForGoals(trx, ids);

  for (const goal of goals) {
    goal.criteria = criteria
      .filter(cr => cr.goalid === goal.id);
  }
  return goals;
}

export async function fetchGoalsForDomain(trx: Transaction, domainIds: number[]) {
  const rows = await trx.table("goals")
    .select("*")
    .whereIn("domainid", domainIds);
  return rowsToFullGoals(trx, rows);
}

export async function insertGoals(trx: Transaction, data: { doelstellingscategorieId: number, name: string, inGebruik: number, creatorId: number }) {
  return await trx.table("goals").insert(data);
}

export async function updateGoals(trx: Transaction, data: { id: number, name: string }) {
  await trx.table("goals").where("id", data.id).update(data);
}

export async function removeGoals(trx: Transaction, id: number) {
  await trx.table("goals").where("id", id).del();
}
