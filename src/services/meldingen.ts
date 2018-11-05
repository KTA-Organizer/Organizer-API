import logger from "../util/logger";
import { Melding } from "../models/Melding";
import * as usersService from "../services/users";
import * as opleidingService from "../services/opleidingen";
import { HttpError } from "../util/httpStatus";
import { sendMail } from "../config/mail";
import { User } from "../models/User";
import { Transaction, QueryBuilder } from "knex";
import { paginate, PaginateResult } from "../config/db";

async function rowToMelding(trx: Transaction, row: any) {
  row.creator = await usersService.fetchUser(trx, row.creatorId);
  row.opleidingen = await fetchOpleidingenForMelding(trx, row.id);
  return (await row) as Melding;
}

export async function fetchOpleidingenForMelding(trx: Transaction, meldingId: number) {
    const rows = await trx
      .table("meldingen_opleidingen")
      .select("*")
      .where("meldingId", meldingId);
    const ids = rows.map((r: any) => r.opleidingId);
    if (ids.length < 1) {
      return [];
    }
    return opleidingService.fetchOpleidingen(trx, ids);
}

export async function paginateAllMeldingen(trx: Transaction, options: { page: number, perPage: number, opleidingId?: number }) {
  let query: QueryBuilder;
  if (options.opleidingId) {
    query = trx
      .table("meldingen_opleidingen")
      .leftJoin("meldingen", "meldingId", "id")
      .where("opleidingId", options.opleidingId);
  } else {
    query = trx
      .table("meldingen");
  }
  query.select("*");
  const paginator: PaginateResult<Melding> = await paginate(query)(options.page, options.perPage);
  const promises = paginator.items
    .map(row => rowToMelding(trx, row));
  paginator.items = await Promise.all(promises);
  return paginator;
}

export async function fetchMelding(trx: Transaction, id: number) {
  const rows = await trx.table("meldingen")
    .select("*")
    .where({ id });
  if (rows.length < 1) return;
  return await rowToMelding(trx, rows[0]);
}

export async function insertMelding(trx: Transaction, data: { tekst: string, teacherId: number, titel: string }) {
  const meldingId = await trx.table("meldingen").insert({
    ...data,
    datum: new Date()
  });
  return meldingId;
}

export async function updateMelding(trx: Transaction, id: number, data: { tekst: string, teacherId: number, titel: string }) {
  await trx.table("meldingen").where("id", id).update(data);
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
