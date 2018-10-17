import Knex from "knex";
import { MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } from "../util/constants";

let instance: Knex;
export default function getInstance() {
  if (!instance) {
    instance = Knex({
      client: "mysql",
      connection: {
        host: MYSQL_HOST,
        port: MYSQL_PORT,
        user: MYSQL_USER,
        password: MYSQL_PASSWORD,
        database: MYSQL_DATABASE
      },
      pool: { min: 2, max: 8 }
    });
  }
  return instance;
}