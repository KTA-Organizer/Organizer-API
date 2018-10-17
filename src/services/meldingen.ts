import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();
import { Melding } from "../models/Melding";
import * as teachersService from "../services/teachers";

async function rowToMelding(row: any) {
    if (row.teacherId) {
        row.teacher = await teachersService.fetchTeacher(row.teacherId);
    }
    return await row as Melding;
}

export async function fetchAllMeldingen()  {
    const rows = await knex("meldingen")
        .select("*")
        .map(rowToMelding);
    if (rows.length < 1)
        return;
    return await rows;
}

export async function fetchMelding(id: number)  {
    const rows = await knex("meldingen")
        .select("*")
        .where({ id });
    if (rows.length < 1)
        return;
    return await rowToMelding(rows[0]);
}

