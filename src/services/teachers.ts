import logger from "../util/logger";
import { Transaction } from "knex";


export async function makeUserTeacher(trx: Transaction, id: number) {
    await trx.table("teachers").insert({ teacherId: id, stillTeacher: 1 });
}

export async function makeUserNotTeacher(trx: Transaction, id: number) {
    await trx.table("teachers").update({ stillTeacher: 0 }).where("teacherId", id);
}

export async function isActiveTeacher(trx: Transaction, id: number)  {
    const rows = await trx.table("teachers")
        .select("*")
        .where({teacherId: id, stillTeacher: 1});
    return rows.length > 0;
}