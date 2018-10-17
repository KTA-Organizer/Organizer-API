import getKnexInstance from "./db";
import { Aspect } from "../models/Aspect";
const knex = getKnexInstance();

export async function fetchAspectForEvaluatieCriteria(id: number) {
  const rows = await knex("aspecten")
    .select("*")
    .where({ evaluatiecriteriumId: id });
  return rows as Aspect[];
}
