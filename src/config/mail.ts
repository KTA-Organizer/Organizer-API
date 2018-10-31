import * as mailer from "nodemailer";
import { Options } from "nodemailer/lib/mailer";
import logger from "../util/logger";
import { loadConfig } from "./storage";
import { ENVIRONMENT } from "../util/env";

let transporter: mailer.Transporter;
async function getTransporter() {
  if (!transporter) {
    const config = await loadConfig();
    transporter = mailer.createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: true,
      auth: {
        user: config.email.smtp.user,
        pass: config.email.smtp.password
      }
    });
  }
  return transporter;
}

// Just a wrapper to make it a Promise
export const sendMail = (mailOptions: Options) => new Promise(async (resolve, reject) => {
  if (ENVIRONMENT === "test") {
    return resolve();
  }
  const config = await loadConfig();
  const transporter = await getTransporter();

  mailOptions.from = config.email.from;

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(info);
  });
});
