import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();
import { Melding } from "../models/Melding";
import * as teachersService from "../services/teachers";
import { HttpError } from "../util/httpStatus";

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

export async function insertMelding(meldingToAdd: any) {
    let meldingId;
    try {
        meldingId = await knex("meldingen")
            .insert({
                "tekst": meldingToAdd.tekst,
                "teacherId": meldingToAdd.teacherId,
                "titel": meldingToAdd.titel,
                "datum": new Date()
            });
        console.log(meldingId);
    } catch (ex) {
        return;
    }
    if (!meldingId) {
        return;
    }
    return await meldingId;
}



