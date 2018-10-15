import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();
import { Opleiding } from "../models/Opleiding";
import * as usersService from "../services/users";

function rowToOpleiding(row: any): Opleiding {
    if (row.creator) {
        row.creator = usersService.fetchUser(row.creator);
    }
    return row as Opleiding;
}

export async function fetchAllOpleidingen()  {
    const rows = await knex("users")
        .select("*")
        .map(rowToOpleiding);
    if (rows.length < 1)
        return;
    return rows;
}

export async function fetchOpleiding(id: number)  {
    const rows = await knex("opleidingen")
        .select("*")
        .where({ id });
    if (rows.length < 1)
        return;
    return rowToOpleiding(rows[0]);
}


