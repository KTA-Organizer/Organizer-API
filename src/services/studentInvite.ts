import { sendMail } from "../config/mail";
import { User } from "../models/User";
import { URL } from "../util/constants";
import logger from "../util/logger";
import * as usersService from "../services/users";
import * as accessTokensService  from "./accessTokens";
import { AccessToken } from "../models/AccessToken";

function getInviteLink(token: string) {
  return `${URL}/invitation?token=${token}`;
}

async function sendStudentInviteMail(name: string, to: string, token: string) {
  const html = `
Beste ${name},
U bent uitgenodigd om een gebruiker aan te maken op het KTA platform.
<a href=${getInviteLink(token)}>Gebruiker aanmaken</a>
  `;

  const info: any = await sendMail({
    to,
    subject: "Uitnodiging KTA platform",
    html
  });
  logger.info("Message sent: %s", info.messageId);
}

export async function inviteUser(user: User) {
  const token = await accessTokensService.createAccessToken(user.id);

  await sendStudentInviteMail(user.firstname, user.email, token);
  console.log("Token:", token);
}

export async function acceptInvitation(accessToken: AccessToken, password: string) {
  await accessTokensService.deleteAccessToken(accessToken.token);
  await usersService.updatePassword(accessToken.userid, password);
}
