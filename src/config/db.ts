import Knex, { Config, Transaction, QueryBuilder } from "knex";
import { loadConfig } from "./storage";
import setupPaginator from "knex-paginator";


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
    setupPaginator(knex);
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

export interface PaginateResult<T> {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
    rows: T[];
}

export const paginate = <T>(query: QueryBuilder) => async (page: number, perPage: number) => {
  const totalAware = true;
  const paginator = await query.paginate(perPage, page, totalAware);
  return {
    rows: paginator.data,
    page,
    perPage,
    total: paginator.total,
    lastPage: paginator.last_page,
  } as PaginateResult<T>;
};