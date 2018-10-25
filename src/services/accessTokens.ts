import { AccessToken } from "../models/AccessToken";
import { genRandomHash } from "../util/randomHash";
import { Transaction } from "knex";

export async function createAccessToken(trx: Transaction, userid: number) {
  const token = genRandomHash();
  const ids = await trx.table("access_tokens").insert({ userid, token });
  return token;
}

export async function deleteAccessToken(trx: Transaction, resetToken: string) {
  await trx.table("access_tokens").delete().where("token", resetToken);
}

function rowToAccessToken(row: any) {
  row.tokenTimestamp = new Date(row.tokenTimestamp);
  return row as AccessToken;
}

export async function fetchAccessToken(trx: Transaction, token: string) {
  const rows = await trx.table("access_tokens").select("*").where("token", token);
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

