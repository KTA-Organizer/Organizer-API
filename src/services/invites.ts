import { sendMail } from "../config/mail";
import { User } from "../models/User";
import { loadConfig } from "../config/storage";
import logger from "../util/logger";
import * as usersService from "./users";
import * as accessTokensService  from "./accessTokens";
import { AccessToken } from "../models/AccessToken";
import { Transaction } from "knex";

async function getInviteLink(token: string) {
  const config = await loadConfig();
  return `${config.url}/#/invitation?token=${token}`;
}

async function sendInviteMail(name: string, to: string, token: string) {
  const html = `
Beste ${name},
U bent uitgenodigd om een gebruiker aan te maken op het KTA platform.
<a href=${await getInviteLink(token)}>Gebruiker aanmaken</a>
  `;

  await sendMail({
    to,
    subject: "Uitnodiging KTA platform",
    html
  });
}

export async function inviteUser(trx: Transaction, user: User) {
  const token = await accessTokensService.createAccessToken(trx, user.id);

  await sendInviteMail(user.firstname, user.email, token);
}
