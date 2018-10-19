import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();
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
  const rows = await knex("doelstellingscategories")
    .select("*")
    .map(rowToDoelstellingsCategorie);
  if (rows.length < 1) return;
  return await rows;
}

export async function fetchDoelstellingsCategorie(id: number) {
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
  const rows = await knex("doelstellingscategories")
    .select("*")
    .whereIn("moduleId", moduleIds);
  return rowsToFullDoelstellingsCategory(rows);
}
