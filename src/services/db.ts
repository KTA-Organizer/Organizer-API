import Knex from "knex";
import { MYSQL_SOCKET, MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } from "../util/constants";

let instance: Knex;
export default function getInstance() {
  if (!instance) {
    let connection;
    if (MYSQL_SOCKET) {
      connection = { socketPath: MYSQL_SOCKET};
    } else {
      connection = {
        host: MYSQL_HOST,
        port: MYSQL_PORT,
        user: MYSQL_USER,
        password: MYSQL_PASSWORD,
        database: MYSQL_DATABASE
      };
    }
    instance = Knex({
      client: "mysql",
      connection,
      pool: { min: 1, max: 10 }
    });
  }
  return instance;
}