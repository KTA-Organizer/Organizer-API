import logger from "../util/logger";
import { Transaction } from "knex";


export async function makeUserAdmin(trx: Transaction, id: number) {
    await trx.table("admins").insert({ adminId: id, stillAdmin: 1 });
}

export async function makeUserNotAdmin(trx: Transaction, id: number) {
    await trx.table("admins").update({ stillAdmin: 0 }).where("adminId", id);
}

export async function isActiveAdmin(trx: Transaction, id: number)  {
    const rows = await trx.table("admins")
        .select("*")
        .where({adminId: id, stillAdmin: 1});
    return rows.length > 0;
}