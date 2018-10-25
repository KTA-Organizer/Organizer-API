import logger from "../util/logger";
import { getKnex } from "../config/db";
import { DoelstellingsCategorie } from "../models/DoelstellingsCategorie";
import * as usersService from "../services/users";
import * as modulesService from "../services/modules";
import { Doelstelling } from "../models/Doelstelling";
import * as doelstellingService from "../services/doelstellingen";

async function rowToDoelstellingsCategorie(row: any) {
    /*if (row.creatorId) {
        row.creator = await usersService.fetchUser(row.creatorId);
    }
    if (row.moduleId) {
        row.module = await modulesService.fetchModule(row.moduleId);
    }*/
    return await row as DoelstellingsCategorie;
}

export async function fetchAllDoelstellingsCategories() {
  const knex = await getKnex();
  const rows = await knex("doelstellingscategories")
    .select("*")
    .map(rowToDoelstellingsCategorie);
  if (rows.length < 1) return;
  return await rows;
}

export async function fetchDoelstellingsCategorie(id: number) {
  const knex = await getKnex();
  const rows = await knex("doelstellingscategories")
    .select("*")
    .where({ id });
  if (rows.length < 1) return;
  return rowToDoelstellingsCategorie(rows[0]);
}

export async function rowsToFullDoelstellingsCategory(rows: any[]) {
  const doelCats = rows as DoelstellingsCategorie[];
  const doelCatIds = doelCats.map(dc => dc.id);

  const doelstellingen = await doelstellingService.fetchDoelstellingenForCategories(doelCatIds);

  for (const doelCat of doelCats) {
    doelCat.doelstellingen = doelstellingen
      .filter(d => d.doelstellingscategorieId === doelCat.id);
  }

  return doelCats;
}

export async function fetchDoelstellingsCategoryForModules(moduleIds: number[]) {
  const knex = await getKnex();
  const rows = await knex("doelstellingscategories")
    .select("*")
    .whereIn("moduleId", moduleIds);
  return rowsToFullDoelstellingsCategory(rows);
}

export async function insertDoelstellingsCategorie(data: { moduleId: number, name: string, inGebruik: number,  creatorId: number }) {
    const knex = await getKnex();
    await knex("doelstellingscategories").insert( data );
}

export async function updateDoelstellingsCategorie(data: { id: number, moduleId: number, name: string, inGebruik: number, creatorId: number }) {
    const knex = await getKnex();
    await knex("doelstellingscategories").where("id", data.id).update( data );
}