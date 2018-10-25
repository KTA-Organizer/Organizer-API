import logger from "../util/logger";
import { getKnex } from "../config/db";
import { Opleiding } from "../models/Opleiding";
import * as usersService from "../services/users";
import * as moduleService from "../services/modules";

async function rowToOpleiding(row: any) {
  if (row.creatorId) {
    row.creator = await usersService.fetchUser(row.creatorId);
  }
  return row as Opleiding;
}

export async function fetchAllOpleidingen() {
  const knex = await getKnex();
  const rows = (await knex("opleidingen").select("*")).map(rowToOpleiding);
  const opleidingenPromises = await Promise.all(rows);
  return opleidingenPromises;
}

export async function fetchOpleiding(id: number) {
  const knex = await getKnex();
  const opleiding_rows = await knex("opleidingen").where("id", id);
  if (opleiding_rows.length < 1) return;
  return await rowToOpleiding(opleiding_rows[0]);
}

async function rowToFullOpleiding(row: Opleiding) {
  const opleiding: Opleiding = await rowToOpleiding(row);
  opleiding.modules = await moduleService.fetchModulesForOpleiding(row.id);
  return row;
}

export async function fetchFullOpleiding(id: number) {
  const knex = await getKnex();
  const opleiding_rows = await knex("opleidingen").where("id", id);
  if (opleiding_rows.length < 1) return;
  return await rowToFullOpleiding(opleiding_rows[0]);
}

export async function fetchOpleidingForStudent(id: number) {
  const knex = await getKnex();
  const opleiding_id = await knex("studenten_modules")
    .select("opleidingId")
    .where({ studentId: id });
  if (opleiding_id.length >= 1) {
    return await fetchOpleiding(opleiding_id[0].opleidingId);
  }
  return undefined;
}

export async function insertOpleiding(data: {name: string, active: number, creatorId: number}) {
  const knex = await getKnex();
  await knex("opleidingen").insert( data );
}

export async function updateOpleiding(data: {id: number, name: string, active: number, creatorId: number}) {
    const knex = await getKnex();
    await knex("opleidingen").where("id", data.id).update( data );
}
