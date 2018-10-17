import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();
import { Doelstelling } from "../models/Doelstelling";
import * as usersService from "../services/users";
import * as doelstellingsCategoriesService from "../services/doelstellingsCategories";

function rowToDoelstelling(row: any): Doelstelling {
    if (row.creatorId) {
        row.creator = usersService.fetchUser(row.creatorId);
    }
    if (row.doelstellingscategorieId) {
        row.doelstellingscategorie = doelstellingsCategoriesService.fetchDoelstellingsCategorie(row.doelstellingscategorieId);
    }
    return row as Doelstelling;
}

export async function fetchAllDoelstellingen()  {
    const rows = await knex("doelstellingen")
        .select("*")
        .map(rowToDoelstelling);
    if (rows.length < 1)
        return;
    return rows;
}

export async function fetchDoelstelling (id: number)  {
    const rows = await knex("doelstellingen")
        .select("*")
        .where({ id });
    if (rows.length < 1)
        return;
    return rowToDoelstelling(rows[0]);
}