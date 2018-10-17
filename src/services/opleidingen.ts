import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();
import { Opleiding } from "../models/Opleiding";
import * as usersService from "../services/users";
import { Module } from "../models/Module";
import { OpleidingVolledig } from "../models/OpleidingVolledig";

function rowToOpleiding(row: any): Opleiding {
  if (row.creatorId) {
    row.creator = usersService.fetchUser(row.creatorId);
  }
  return row as Opleiding;
}

async function rowToOpleidingVolledig(opleiding: any) {
  if (opleiding.creatorId) {
    opleiding.creator = await usersService.fetchUser(opleiding.creatorId);
  }
  return await opleiding as OpleidingVolledig;
}

export async function fetchAllOpleidingen() {
  const rows = await knex("opleidingen")
    .select("*")
    .map(rowToOpleiding);
  if (rows.length < 1) return;
  return await rows;
}

export async function fetchOpleiding(id: number) {
  const opleiding_rows = await knex("opleidingen").where("id", id);
  if (opleiding_rows.length < 1) return;
  const modules = (await knex("modules").where("opleidingId", id));
  return new OpleidingVolledig(opleiding_rows[0], modules);
}


