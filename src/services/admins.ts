import logger from "../util/logger";
import { Transaction } from "knex";


export async function isActiveAdmin(trx: Transaction, id: number)  {
    const rows = await trx.table("admins")
        .select("*")
        .where({adminId: id, stillAdmin: 1});
    return rows.length > 0;
}