import { sendMail } from "../config/mail";
import logger from "../util/logger";
import { loadConfig } from "../config/storage";
import { User } from "../models/User";
import * as usersService from "../services/users";
import * as accessTokensService  from "./accessTokens";
import { AccessToken } from "../models/AccessToken";
import { Transaction } from "knex";

async function getResetLink(resetToken: string) {
  const config = await loadConfig();
  return `${config.url}/#/reset?token=${resetToken}`;
}

async function sendResetMail(to: string, resetToken: string) {
  const html = `
Wachtwoord vergeten? Geen Paniek!
<a href=${await getResetLink(resetToken)}>Wachtwoord wijzigen</a>
<br/>
Negeer dit bericht indien u geen aanvraag heeft ingediend.
  `;

  await sendMail({
    to,
    subject: "Wachtwoord vergeten",
    html
  });
}
export async function requestPasswordReset(trx: Transaction, user: User) {
  const token = await accessTokensService.createAccessToken(trx, user.id);

  await sendResetMail(user.email, token);
}