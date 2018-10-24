import { sendMail } from "../config/mail";
import logger from "../util/logger";
import { loadConfig } from "../config/storage";
import { User } from "../models/User";
import * as usersService from "../services/users";
import * as accessTokensService  from "./accessTokens";
import { AccessToken } from "../models/AccessToken";

async function getResetLink(resetToken: string) {
  const config = await loadConfig();
  return `${config.url}/reset?token=${resetToken}`;
}

async function sendResetMail(to: string, resetToken: string) {
  const html = `
Wachtwoord vergeten? Geen Paniek!
<a href=${await getResetLink(resetToken)}>Wachtwoord wijzigen</a>
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
  const token = await accessTokensService.createAccessToken(user.id);

  await sendResetMail(user.email, token);
  console.log("Token:", token);
}

export async function resetPassword(accessToken: AccessToken, password: string) {
  await accessTokensService.deleteAccessToken(accessToken.token);
  await usersService.updatePassword(accessToken.userid, password);
}