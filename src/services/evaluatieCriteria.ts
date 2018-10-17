import getKnexInstance from "./db";
import { EvaluatieCriteria } from "../models/EvaluatieCriteria";
const knex = getKnexInstance();

export async function fetchEvaluatieCriteria() {
    const rows = await knex ("evaluatiecriteria")
    .select("*");
    return rows as EvaluatieCriteria[];
}

export async function fetchEvaluatieCriteriaForDoelstelling(id: number) {
    const rows = await knex ("evaluatiecriteria")
    .select("*")
    .where({"doelstellingId": id});
    return rows as EvaluatieCriteria[];
}