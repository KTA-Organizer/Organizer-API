import logger from "../util/logger";
import getKnexInstance from "../config/db";
const knex = getKnexInstance();
import { Melding } from "../models/Melding";
import * as teachersService from "../services/teachers";
import { HttpError } from "../util/httpStatus";
import { sendMail } from "../config/mail";
import { User } from "../models/User";

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
    try {
        const meldingId = await knex("meldingen")
            .insert({
                "tekst": meldingToAdd.tekst,
                "teacherId": meldingToAdd.teacherId,
                "titel": meldingToAdd.titel,
                "datum": new Date()
            });
        console.log(meldingId);
        return await meldingId;
    } catch (ex) {
        return;
    }
}

export async function fetchOpleidingenFromMeldingAsArray(id: number)  {
    const rows = await knex("meldingen_opleidingen")
        .select("opleidingId")
        .where("meldingId", id)
        .map((opleiding: any) => opleiding.opleidingId);
    if (rows.length < 1)
        return;
    return await rows;
}

export async function requestAlertMelding(users: User[], link: string) {
    for (const user of users) {
        await sendNewMeldingMail(user.email, link);
    }
}

async function sendNewMeldingMail(to: string, link: string) {
    const html = `
Opgelet! Eén nieuwe melding ontvangen!
Klik<a href=${link}> hier </a>om te openen.
  `;
    const info: any = await sendMail({
        to,
        subject: "Nieuwe melding",
        html
    });
    logger.info("Message sent: %s", info.messageId);
}



