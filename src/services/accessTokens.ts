import { AccessToken } from "../models/AccessToken";
import { genRandomHash } from "../util/randomHash";
import getKnexInstance from "../config/db";
const knex = getKnexInstance();

export async function createAccessToken(userid: number) {
  const token = genRandomHash();
  const ids = await knex("access_tokens").insert({ userid, token });
  return token;
}

export async function deleteAccessToken(resetToken: string) {
  await knex("access_tokens").delete().where("token", resetToken);
}

function rowToAccessToken(row: any) {
  row.tokenTimestamp = new Date(row.tokenTimestamp);
  return row as AccessToken;
}

export async function fetchAccessToken(token: string) {
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

