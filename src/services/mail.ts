import * as mailer from "nodemailer";
import { Options } from "nodemailer/lib/mailer";
import { URL, MAIL_FROM, MAIL_SMTP_HOST, MAIL_SMTP_PORT, MAIL_SMTP_USERNAME, MAIL_SMTP_PASSWORD } from "../util/constants";
import logger from "../util/logger";

const transporter = mailer.createTransport({
  host: MAIL_SMTP_HOST,
  port: MAIL_SMTP_PORT,
  secure: true,
  auth: {
    user: MAIL_SMTP_USERNAME,
    pass: MAIL_SMTP_PASSWORD
  }
});

// Just a wrapper to make it a Promise
const sendMail = (mailOptions: Options) => new Promise((resolve, reject) => {
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(info);
  });
});

export async function sendInvite(to: string, activationKey: string) {
  const html = `Je bent uitgenodigd om je resultaten te bekijken <a href="${URL}/signup?activationKey=${activationKey}">Klik hier om je rapport te bekijken</a>`;
  const mailOptions = {
    from: MAIL_FROM,
    to,
    subject: "Uitnodiging leerplatform KTA",
    html
  };

  const info: any = await sendMail(mailOptions);
  logger.info("Message sent: %s", info.messageId);

}