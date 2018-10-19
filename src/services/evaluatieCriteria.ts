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
  const criteriaIds = criteria.map(c => c.id);
  const aspecten = await aspectenService.fetchAspectenForEvaluatieCriteria(criteriaIds);

  for (const criterium of criteria) {
    criterium.aspecten = aspecten
      .filter(a => a.evaluatiecriteriumId == criterium.id);
  }
  return criteria;
}

export async function fetchEvaluatieCriteriaForDoelstellingen(doelstellingenIds: number[]) {
  const rows = await knex("evaluatiecriteria")
    .select("*")
    .whereIn("doelstellingId", doelstellingenIds);
  return await rowsToFullEvaluatieCriteria(rows);
}
