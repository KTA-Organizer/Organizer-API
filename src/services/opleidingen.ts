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

function rowToOpleidingVolledig(opleiding: any) {
  if (opleiding.creatorId) {
    opleiding.creator = usersService.fetchUser(opleiding.creatorId);
  }
  return opleiding as OpleidingVolledig;
}

export async function fetchAllOpleidingen() {
  const rows = await knex("opleidingen")
    .select("*")
    .map(rowToOpleiding);
  if (rows.length < 1) return;
  return rows;
}

export async function fetchOpleiding(id: number) {
  const opleiding_rows = await knex("opleidingen").where("id", id);
  if (opleiding_rows.length < 1) return;
  opleiding_rows.modules = await knex("modules").where("opleidingId", id) as Module[];
  console.log(rowToOpleidingVolledig(opleiding_rows));
  return new OpleidingVolledig(opleiding_rows as Opleiding, opleiding_rows as Module[]);
}
