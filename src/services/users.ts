import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();
import { User } from "../models/User";

async function rowToUser(row: any) {
  if (row.accountCreatedTimestamp) {
    row.accountCreatedTimestamp = new Date(row.accountCreatedTimestamp);
  }
  return await row as User;
}

export async function fetchUser(id: number)  {
  const rows = await knex("users")
    .select("*")
    .where({ id });
  if (rows.length < 1)
    return;
  return await rowToUser(rows[0]);
}

export async function fetchUserByEmail(email: string)  {
    const rows = await knex("users")
        .select("*")
        .where({ email });
    if (rows.length < 1)
        return;
    return await rowToUser(rows[0]);
}