import getKnexInstance from "./db";
import { EvaluatieCriteria } from "../models/EvaluatieCriteria";
import * as aspectenService from "./aspecten";
const knex = getKnexInstance();

export async function fetchEvaluatieCriteria() {
  const rows = await knex("evaluatiecriteria").select("*");
  return rows as EvaluatieCriteria[];
}

async function rowsToFullEvaluatieCriteria(rows: any) {
  const criteria = rows as EvaluatieCriteria[];
  for (const criterium of criteria) {
    criterium.aspecten = await aspectenService.fetchAspectenForEvaluatieCriteria(
      criterium.id
    );
  }
  return criteria;
}

export async function fetchEvaluatieCriteriaForDoelstelling(id: number) {
  const rows = await knex("evaluatiecriteria")
    .select("*")
    .where({ doelstellingId: id });
  return rowsToFullEvaluatieCriteria(rows);
}
