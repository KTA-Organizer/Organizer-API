import logger from "../util/logger";
import { Transaction } from "knex";


export async function isActiveTeacher(trx: Transaction, id: number)  {
    const rows = await trx.table("teachers")
        .select("*")
        .where({teacherId: id, stillTeacher: 1});
    return rows.length > 0;
}