import * as mailer from "nodemailer";
import { Options } from "nodemailer/lib/mailer";
import { MAIL_FROM, MAIL_SMTP_HOST, MAIL_SMTP_PORT, MAIL_SMTP_USERNAME, MAIL_SMTP_PASSWORD } from "../util/constants";
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
export const sendMail = (mailOptions: Options) => new Promise((resolve, reject) => {
  mailOptions.from = MAIL_FROM;
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(info);
  });
});
