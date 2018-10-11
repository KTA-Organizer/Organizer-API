import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();
import { User } from "../models/User";

function rowToUser(row: any): User {
  if (row.accountCreatedTimestamp) {
    row.accountCreatedTimestamp = new Date(row.accountCreatedTimestamp);
  }
  return row as User;
}

export async function fetchUser(id: number)  {
  const rows = await knex("users")
    .select("*")
    .where({ id });
  if (rows.length < 1)
    return;
  return rowToUser(rows[0]);
}