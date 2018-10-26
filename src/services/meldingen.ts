import logger from "../util/logger";
import { Melding } from "../models/Melding";
import * as usersService from "../services/users";
import { HttpError } from "../util/httpStatus";
import { sendMail } from "../config/mail";
import { User } from "../models/User";
import { Transaction } from "knex";

async function rowToMelding(trx: Transaction, row: any) {
  if (row.teacherId) {
    row.teacher = await usersService.fetchUser(trx, row.teacherId);
  }
  return (await row) as Melding;
}

export async function fetchAllMeldingen(trx: Transaction) {
  const rows = await trx.table("meldingen")
    .select("*")
    .map(row => rowToMelding(trx, row));
  if (rows.length < 1) return;
  return await rows;
}

export async function fetchMelding(trx: Transaction, id: number) {
  const rows = await trx.table("meldingen")
    .select("*")
    .where({ id });
  if (rows.length < 1) return;
  return await rowToMelding(trx, rows[0]);
}

export async function insertMelding(trx: Transaction, meldingToAdd: any) {
  const meldingId = await trx.table("meldingen").insert({
    tekst: meldingToAdd.tekst,
    teacherId: meldingToAdd.teacherId,
    titel: meldingToAdd.titel,
    datum: new Date()
  });
  return meldingId;
}

export async function addMeldingWithOpleiding(
  trx: Transaction,
  meldingId: number,
  opleidingId: number,
) {
  await trx.table("meldingen_opleidingen").insert({ meldingId, opleidingId });
}

export async function fetchOpleidingenFromMeldingAsArray(trx: Transaction, id: number) {
  const rows = await trx.table("meldingen_opleidingen")
    .select("opleidingId")
    .where("meldingId", id)
    .map((opleiding: any) => opleiding.opleidingId);
  if (rows.length < 1) return;
  return await rows;
}

export async function requestAlertMelding(users: User[], link: string, data: {titel: string, teacher: any}) {
  for (const user of users) {
    await sendNewMeldingMail(user.email, link, data);
  }
}

async function sendNewMeldingMail(to: string, link: string, data: {titel: string, teacher: any}) {
  const html = `
Opgelet! Eén nieuwe melding ontvangen!
Klik<a href=${link}> hier </a>om te openen.
<p>Melding toegevoegd door <strong>${data.teacher.firstname} ${data.teacher.lastname}</strong>:</p>
<p>${data.titel}</p>
  `;
  const info: any = await sendMail({
    to,
    subject: "Nieuwe melding",
    html
  });
  logger.info("Message sent: %s", info.messageId);
}

export async function removeMelding(trx: Transaction, id: number) {
  await trx.table("meldingen_opleidingen")
    .where({ meldingId: id })
    .del();
  await trx.table("meldingen")
    .where({ id })
    .del();
}
