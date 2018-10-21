import getKnexInstance from "../config/db";
import { Aspect } from "../models/Aspect";
const knex = getKnexInstance();

export async function fetchAspectenForEvaluatieCriteria(criteriaIds: number[]) {
  const rows = await knex("aspecten")
    .select("*")
    .whereIn("evaluatiecriteriumId", criteriaIds);
  return rows as Aspect[];
}
