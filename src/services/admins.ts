import logger from "../util/logger";
import { getKnex } from "../config/db";


export async function fetchAdmin(id: number)  {
    const knex = await getKnex();
    const rows = await knex("admins")
        .select("*")
        .where({adminId: id});
    if (rows.length < 1)
        return;
    return await rows[0];
}