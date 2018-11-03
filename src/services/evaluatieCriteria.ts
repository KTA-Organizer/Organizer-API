import { EvaluatieCriteria } from "../models/EvaluatieCriteria";
import * as aspectenService from "./aspecten";
import { Transaction } from "knex";
import { CacheMap } from "../config/caching";

const evalutatieCriteriaCache = new CacheMap<number, EvaluatieCriteria>("evaluatieCriteria");

export async function fetchEvaluatieCriteria(trx: Transaction) {
  const rows = await trx.table("evaluatiecriteria").select("*");
  return rows as EvaluatieCriteria[];
}

export const fetchEvaluatieCriteriaById = (trx: Transaction, id: number) => evalutatieCriteriaCache.wrap(id, async () => {
    const rows = await trx.table("evaluatiecriteria")
        .select("*")
        .where({ id });
    if (rows.length < 1)
        return;
    return await rows[0];
});

async function rowsToFullEvaluatieCriteria(trx: Transaction, rows: any) {
  const criteria = rows as EvaluatieCriteria[];
  const criteriaIds = criteria.map(c => c.id);
  const aspecten = await aspectenService.fetchAspectenForEvaluatieCriteria(trx, criteriaIds);

  for (const criterium of criteria) {
    criterium.aspecten = aspecten
      .filter(a => a.evaluatiecriteriumId == criterium.id);
  }
  return criteria;
}

export async function fetchEvaluatieCriteriaForDoelstellingen(trx: Transaction, doelstellingenIds: number[]) {
  const rows = await trx.table("evaluatiecriteria")
    .select("*")
    .whereIn("doelstellingId", doelstellingenIds);
  return await rowsToFullEvaluatieCriteria(trx, rows);
}

export async function insertEvaluatieCriteria(trx: Transaction, data: { doelstellingId: number, name: string, inGebruik: number, gewicht: number, creatorId: number }) {
    return await trx.table("evaluatiecriteria").insert( data );
}

export async function updateEvaluatieCriteria(trx: Transaction, data: { id: number, name: string }) {
    evalutatieCriteriaCache.changed(data.id);
    await trx.table("evaluatiecriteria").where("id", data.id).update( data );
}

export async function deleteEvaluatieCriteria(trx: Transaction, id: number) {
    evalutatieCriteriaCache.changed(id);
    await trx.table("evaluatiecriteria").where("id", id).del();
}
