import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();
import { Melding } from "../models/Melding";
import * as teachersService from "../services/teachers";

function rowToMelding(row: any): Melding {
    if (row.teacherId) {
        row.teacher = teachersService.fetchTeacher(row.teacherId);
    }
    return row as Melding;
}

export async function fetchAllMeldingen()  {
    const rows = await knex("meldingen")
        .select("*")
        .map(rowToMelding);
    if (rows.length < 1)
        return;
    return rows;
}

export async function fetchMelding(id: number)  {
    const rows = await knex("meldingen")
        .select("*")
        .where({ id });
    if (rows.length < 1)
        return;
    return rowToMelding(rows[0]);
}

