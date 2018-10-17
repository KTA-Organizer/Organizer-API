import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();
import { Doelstelling } from "../models/Doelstelling";
import * as usersService from "../services/users";
import * as doelstellingsCategoriesService from "../services/doelstellingsCategories";

async function rowToDoelstelling(row: any) {
    /*if (row.creatorId) {
        row.creator = await usersService.fetchUser(row.creatorId);
    }*/
    return await row as Doelstelling;
}

export async function fetchAllDoelstellingen()  {
    const rows = await knex("doelstellingen")
        .select("*")
        .map(rowToDoelstelling);
    if (rows.length < 1)
        return;
    return await rows;
}

export async function fetchDoelstelling (id: number)  {
    const rows = await knex("doelstellingen")
        .select("*")
        .where({ id });
    if (rows.length < 1)
        return;
    return await rowToDoelstelling(rows[0]);
}
