import logger from "../util/logger";
import { Domain } from "../models/Domain";
import * as goalsService from "../services/goals";
import { Transaction } from "knex";

function rowToDomain(row: any) {
    return row as Domain;
}

export async function rowsToFullDoelstellingsCategory(trx: Transaction, rows: any[]) {
  const domains = rows.map(rowToDomain);
  const domainIds = domains.map(dc => dc.id);

  const goals = await goalsService.fetchGoalsForDomain(trx, domainIds);

  for (const domain of domains) {
    domain.goals = goals
      .filter(d => d.domainid === domain.id);
  }

  return domains;
}

export async function fetchDomainsForModule(trx: Transaction, moduleid: number) {
  const rows = await trx.table("domains")
    .select("*")
    .where("moduleid", moduleid);
  return rowsToFullDoelstellingsCategory(trx, rows);
}

export async function insertDomain(trx: Transaction, data: { moduleid: number, name: string, creatorId: number }) {
    return await trx.table("domains").insert( data );
}

export async function updateDomain(trx: Transaction, id: number, data: { name: string}) {
    await trx.table("domains").where("id", id).update( data );
}