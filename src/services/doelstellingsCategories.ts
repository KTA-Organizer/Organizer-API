import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();
import { DoelstellingsCategorie } from "../models/DoelstellingsCategorie";
import * as usersService from "../services/users";
import * as modulesService from "../services/modules";

async function rowToDoelstellingsCategorie(row: any) {
    if (row.creatorId) {
        row.creator = await usersService.fetchUser(row.creatorId);
    }
    if (row.moduleId) {
        row.module = await modulesService.fetchModule(row.moduleId);
    }
    return await row as DoelstellingsCategorie;
}

export async function fetchAllDoelstellingsCategories()  {
    const rows = await knex("doelstellingscategories")
        .select("*")
        .map(rowToDoelstellingsCategorie);
    if (rows.length < 1)
        return;
    return await rows;
}

export async function fetchDoelstellingsCategorie(id: number)  {
    const rows = await knex("doelstellingscategories")
        .select("*")
        .where({ id });
    if (rows.length < 1)
        return;
    return await rowToDoelstellingsCategorie(rows[0]);
}