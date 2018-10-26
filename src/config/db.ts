import Knex, { Config, Transaction } from "knex";
import { loadConfig } from "./storage";

let knex: Knex;
async function getKnex() {
  const config = await loadConfig();
  if (!knex) {
    const connection: Config["connection"] = {
      user: config.mysql.user,
      password: config.mysql.password,
      database: config.mysql.database
    };
    if (!config.mysql.host) {
      connection.socketPath = `/cloudsql/${config.gcloud.sqlInstance}`;
    } else {
      connection.host = config.mysql.host;
      connection.port = config.mysql.port;
    }
    knex = Knex({
      client: "mysql2",
      connection,
      pool: { min: 1, max: 10 }
    });
  }
  return knex;
}


export const createTrx = (): Promise<Transaction> => new Promise((resolve, reject) => {
  getKnex().then(knex => {
    knex.transaction((trx) => {
      resolve(trx);
    }).catch(() => {});
  }).catch(reject);
});