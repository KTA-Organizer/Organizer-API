import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();
import { Opleiding } from "../models/Opleiding";
import * as usersService from "../services/users";
import { Module } from "../models/Module";
import { OpleidingVolledig } from "../models/OpleidingVolledig";

function rowToOpleiding(row: any): Opleiding {
  if (row.creator) {
    row.creator = usersService.fetchUser(row.creator);
  }
  return row as Opleiding;
}

function rowToOpleidingVolledig(opleiding: any) {
  if (opleiding.creator) {
    opleiding.creator = usersService.fetchUser(opleiding.creator);
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
  const modules = (await knex("modules").where("opleidingId", id));
  return new OpleidingVolledig(opleiding_rows[0], modules);
}
