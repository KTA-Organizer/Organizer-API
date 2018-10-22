import getKnexInstance from "../config/db";
import { EvaluatieCriteria } from "../models/EvaluatieCriteria";
import * as aspectenService from "./aspecten";
const knex = getKnexInstance();

export async function fetchEvaluatieCriteria() {
  const rows = await knex("evaluatiecriteria").select("*");
  return rows as EvaluatieCriteria[];
}

export async function fetchEvaluatieCriteriaById(id: number)  {
    const rows = await knex("evaluatiecriteria")
        .select("*")
        .where({ id });
    if (rows.length < 1)
        return;
    return await rows[0];
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

export async function insertEvaluatieCriteria(data: { doelstellingId: number, name: string, inGebruik: number, gewicht: number, creatorId: number }) {
    await knex("evaluatiecriteria").insert( data );
}

export async function updateEvaluatieCriteria(data: { id: number, doelstellingId: number, name: string, inGebruik: number, gewicht: number, creatorId: number }) {
    await knex("evaluatiecriteria").where("id", data.id).update( data );
}
