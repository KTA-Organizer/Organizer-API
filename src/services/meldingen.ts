import logger from "../util/logger";
import { Melding } from "../models/Melding";
import * as usersService from "../services/users";
import { HttpError } from "../util/httpStatus";
import { sendMail } from "../config/mail";
import { User } from "../models/User";
import { Transaction, QueryBuilder } from "knex";
import { paginate, PaginateResult } from "../config/db";

async function rowToMelding(trx: Transaction, row: any) {
  row.creator = await usersService.fetchUser(trx, row.creatorId);
  return (await row) as Melding;
}

export async function paginateAllMeldingen(trx: Transaction, options: { page: number, perPage: number }) {
  const query = trx
    .table("meldingen")
    .select("*");
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

export async function removeMelding(trx: Transaction, id: number) {
  await trx.table("meldingen")
    .where({ id })
    .del();
}
