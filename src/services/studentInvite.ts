import { sendMail } from "../config/mail";
import { User } from "../models/User";
import { loadConfig } from "../config/storage";
import logger from "../util/logger";
import * as usersService from "../services/users";
import * as accessTokensService  from "./accessTokens";
import { AccessToken } from "../models/AccessToken";
import { Transaction } from "knex";

async function getInviteLink(token: string) {
  const config = await loadConfig();
  return `${config.url}/invitation?token=${token}`;
}

async function sendStudentInviteMail(name: string, to: string, token: string) {
  const html = `
Beste ${name},
U bent uitgenodigd om een gebruiker aan te maken op het KTA platform.
<a href=${await getInviteLink(token)}>Gebruiker aanmaken</a>
  `;

  const info: any = await sendMail({
    to,
    subject: "Uitnodiging KTA platform",
    html
  });
  logger.info("Message sent: %s", info.messageId);
}

export async function inviteUser(trx: Transaction, user: User) {
  const token = await accessTokensService.createAccessToken(trx, user.id);

  await sendStudentInviteMail(user.firstname, user.email, token);
  console.log("Token:", token);
}

export async function acceptInvitation(trx: Transaction, accessToken: AccessToken, password: string) {
  await accessTokensService.deleteAccessToken(trx, accessToken.token);
  await usersService.updatePassword(trx, accessToken.userid, password);
  await usersService.activateUser(trx, accessToken.userid);
}
