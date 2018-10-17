import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();
import { DoelstellingsCategorie } from "../models/DoelstellingsCategorie";
import * as usersService from "../services/users";
import * as modulesService from "../services/modules";

function rowToDoelstellingsCategorie(row: any): DoelstellingsCategorie {
    if (row.creatorId) {
        row.creator = usersService.fetchUser(row.creatorId);
    }
    if (row.moduleId) {
        row.module = modulesService.fetchModule(row.moduleId);
    }
    return row as DoelstellingsCategorie;
}

export async function fetchAllDoelstellingsCategories()  {
    const rows = await knex("doelstellingscategories")
        .select("*")
        .map(rowToDoelstellingsCategorie);
    if (rows.length < 1)
        return;
    return rows;
}

export async function fetchDoelstellingsCategorie(id: number)  {
    const rows = await knex("doelstellingscategories")
        .select("*")
        .where({ id });
    if (rows.length < 1)
        return;
    return rowToDoelstellingsCategorie(rows[0]);
}

export async function fetchDoelstellingsCategoryForModule(id: number) {
    const rows = await knex("doelstellingscategories")
    .select("*")
    .where({"moduleId": id});
    return await rows as DoelstellingsCategorie[];
}