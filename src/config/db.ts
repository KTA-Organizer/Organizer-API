import Knex, { Config } from "knex";
import { config } from "./storage";

let instance: Knex;
export default function getInstance() {
  if (!instance) {
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
    instance = Knex({
      client: "mysql2",
      connection,
      pool: { min: 1, max: 10 }
    });
  }
  return instance;
}