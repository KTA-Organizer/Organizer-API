import { AccessToken, AccessTokenType } from "../models/AccessToken";
import { genRandomHash } from "../util/randomHash";
import { Transaction } from "knex";
import { fetchUser } from "./users";
import { User, UserStatus } from "../models/User";

export async function createAccessToken(trx: Transaction, userid: number) {
  const token = genRandomHash();
  const ids = await trx.table("access_tokens").insert({ userid, token });
  return token;
}

export async function deleteAccessToken(trx: Transaction, resetToken: string) {
  await trx.table("access_tokens").delete().where("token", resetToken);
}

const deduceAccessTokenType = (user: User) =>
  user.status === UserStatus.waitActivation ? AccessTokenType.invitation : AccessTokenType.passwordReset;

async function rowToAccessToken(trx: Transaction, row: any) {
  const at = row as AccessToken;
  at.tokenTimestamp = new Date(row.tokenTimestamp);
  at.user = await fetchUser(trx, row.userid);
  at.type = deduceAccessTokenType(at.user);
  return at;
}

export async function fetchAccessToken(trx: Transaction, token: string) {
  const rows = await trx.table("access_tokens").select("*").where("token", token);
  if (rows.length !== 1) {
    return;
  }
  return await rowToAccessToken(trx, rows[0]);
}

export function hasResetTokenExpired(token: AccessToken) {
  const timeDiffMs = Date.now() - token.tokenTimestamp.getTime();
  // 2 weeks in miliseconds
  const weeksInMs = 14 * 24 * 60 * 60 * 1000;
  return timeDiffMs > weeksInMs;
}

