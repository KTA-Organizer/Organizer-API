import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();
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
  const rows = await knex("opleidingen").select("*");
  const opleidingenPromises = rows.map(rowToOpleiding);
  return await Promise.all(opleidingenPromises);
}

export async function fetchOpleiding(id: number) {
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
  const opleiding_rows = await knex("opleidingen").where("id", id);
  if (opleiding_rows.length < 1) return;
  return await rowToFullOpleiding(opleiding_rows[0]);
}
