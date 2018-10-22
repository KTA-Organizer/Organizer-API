import * as mailer from "nodemailer";
import { Options } from "nodemailer/lib/mailer";
import logger from "../util/logger";
import { config } from "./storage";

const transporter = mailer.createTransport({
  host: config.email.smtp.host,
  port: config.email.smtp.port,
  secure: true,
  auth: {
    user: config.email.smtp.user,
    pass: config.email.smtp.password
  }
});

// Just a wrapper to make it a Promise
export const sendMail = (mailOptions: Options) => new Promise((resolve, reject) => {
  mailOptions.from = config.email.from;
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(info);
  });
});
