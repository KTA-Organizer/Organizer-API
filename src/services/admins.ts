import logger from "../util/logger";
import { getKnex } from "../config/db";


export async function isActiveAdmin(id: number)  {
    const knex = await getKnex();
    const rows = await knex("admins")
        .select("*")
        .where({adminId: id, stillAdmin: 1});
    return rows.length > 0;
}