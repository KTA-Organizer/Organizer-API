import { AccessToken } from "../models/AccessToken";
import { genRandomHash } from "../util/randomHash";
import { getKnex } from "../config/db";

export async function createAccessToken(userid: number) {
  const token = genRandomHash();
  const knex = await getKnex();
  const ids = await knex("access_tokens").insert({ userid, token });
  return token;
}

export async function deleteAccessToken(resetToken: string) {
  const knex = await getKnex();
  await knex("access_tokens").delete().where("token", resetToken);
}

function rowToAccessToken(row: any) {
  row.tokenTimestamp = new Date(row.tokenTimestamp);
  return row as AccessToken;
}

export async function fetchAccessToken(token: string) {
  const knex = await getKnex();
  const rows = await knex("access_tokens").select("*").where("token", token);
  if (rows.length !== 1) {
    return;
  }
  const passReset = await rowToAccessToken(rows[0]);
  const timeDiffMs = Date.now() - passReset.tokenTimestamp.getTime();
  // 2 weeks in miliseconds
  const weeksInMs = 14 * 24 * 60 * 60 * 1000;
  if (timeDiffMs > weeksInMs) {
    return;
  }

  return passReset;
}

