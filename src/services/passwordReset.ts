import { sendMail } from "../config/mail";
import logger from "../util/logger";
import { URL } from "../util/constants";
import { genRandomHash } from "../util/randomHash";
import { User } from "../models/User";
import * as usersService from "../services/users";
import getKnexInstance from "./db";
import { PasswordReset } from "../models/PasswordReset";
const knex = getKnexInstance();

function createResetToken() {
  const token = genRandomHash();
  return token;
}

function getResetLink(resetToken: string) {
  return `${URL}/reset?token=${resetToken}`;
}

async function insertResetToken(userid: number, resetToken: string) {
  const ids = await knex("password_resets").insert({ userid, token: resetToken });
}

async function sendResetMail(to: string, resetToken: string) {
  const html = `
Wachtwoord vergeten? Geen Paniek!
<a href=${getResetLink(resetToken)}>Wachtwoord wijzigen</a>
Als u geen aanvraag heeft gemaakt om u wachtwoord te veranderen hoeft u niets te doen.
  `;

  const info: any = await sendMail({
    to,
    subject: "Wachtwoord vergeten",
    html
  });
  logger.info("Message sent: %s", info.messageId);
}
export async function requestPasswordReset(user: User) {
  const resetToken = createResetToken();

  await insertResetToken(user.id, resetToken);

  await sendResetMail(user.email, resetToken);
  console.log("Token:", resetToken);
}

function rowToPasswordReset(row: any) {
  row.tokenTimestamp = new Date(row.tokenTimestamp);
  return row as PasswordReset;
}

export async function fetchPasswordReset(token: string) {
  const rows = await knex("password_resets").select("*").where("token", token);
  if (rows.length !== 1) {
    return;
  }
  const passReset = await rowToPasswordReset(rows[0]);
  const timeDiffMs = Date.now() - passReset.tokenTimestamp.getTime();
  // 24 hours in miliseconds
  const fullDayInMs = 24 * 60 * 60 * 1000;
  if (timeDiffMs > fullDayInMs) {
    return;
  }

  return passReset;
}

async function deleteResetToken(resetToken: string) {
  await knex("password_resets").delete().where("token", resetToken);
}

export async function resetPassword(passwordReset: PasswordReset, password: string) {
  await deleteResetToken(passwordReset.token);
  usersService.updatePassword(passwordReset.userid, password);
}