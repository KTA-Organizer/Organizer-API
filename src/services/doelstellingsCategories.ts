import logger from "../util/logger";
import { DoelstellingsCategorie } from "../models/DoelstellingsCategorie";
import * as doelstellingService from "../services/doelstellingen";
import { Transaction } from "knex";

async function rowToDoelstellingsCategorie(row: any) {
    /*if (row.creatorId) {
        row.creator = await usersService.fetchUser(row.creatorId);
    }
    if (row.moduleId) {
        row.module = await modulesService.fetchModule(row.moduleId);
    }*/
    return await row as DoelstellingsCategorie;
}

export async function fetchAllDoelstellingsCategories(trx: Transaction) {
  const rows = await trx.table("doelstellingscategories")
    .select("*")
    .map(rowToDoelstellingsCategorie);
  if (rows.length < 1) return;
  return await rows;
}

export async function fetchDoelstellingsCategorie(trx: Transaction, id: number) {
  const rows = await trx.table("doelstellingscategories")
    .select("*")
    .where({ id });
  if (rows.length < 1) return;
  return rowToDoelstellingsCategorie(rows[0]);
}

export async function rowsToFullDoelstellingsCategory(trx: Transaction, rows: any[]) {
  const doelCats = rows as DoelstellingsCategorie[];
  const doelCatIds = doelCats.map(dc => dc.id);

  const doelstellingen = await doelstellingService.fetchDoelstellingenForCategories(trx, doelCatIds);

  for (const doelCat of doelCats) {
    doelCat.doelstellingen = doelstellingen
      .filter(d => d.doelstellingscategorieId === doelCat.id);
  }

  return doelCats;
}

export async function fetchDoelstellingsCategoryForModules(trx: Transaction, moduleIds: number[]) {
  const rows = await trx.table("doelstellingscategories")
    .select("*")
    .whereIn("moduleId", moduleIds);
  return rowsToFullDoelstellingsCategory(trx, rows);
}

export async function insertDoelstellingsCategorie(trx: Transaction, data: { moduleId: number, name: string, inGebruik: number,  creatorId: number }) {
    await trx.table("doelstellingscategories").insert( data );
}

export async function updateDoelstellingsCategorie(trx: Transaction, data: { id: number, moduleId: number, name: string, inGebruik: number, creatorId: number }) {
    await trx.table("doelstellingscategories").where("id", data.id).update( data );
}

export async function removeDoelstellingsCategorie(trx: Transaction, id: number) {
    await trx.table("doelstellingscategories").where("id", id).del();
}