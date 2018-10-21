import Knex, { Config } from "knex";
import { GCLOUD_SQL_INSTANCE, MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } from "../util/constants";

let instance: Knex;
export default function getInstance() {
  if (!instance) {
    const connection: Config["connection"] = {
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE
    };
    if (!MYSQL_HOST && GCLOUD_SQL_INSTANCE) {
      connection.socketPath = `/cloudsql/${GCLOUD_SQL_INSTANCE}`;
    } else {
      connection.host = MYSQL_HOST;
      connection.port = MYSQL_PORT;
    }
    instance = Knex({
      client: "mysql2",
      connection,
      pool: { min: 1, max: 10 }
    });
  }
  return instance;
}