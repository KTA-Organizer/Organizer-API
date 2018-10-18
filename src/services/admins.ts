import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();


export async function fetchAdmin(id: number)  {
    const rows = await knex("admins")
        .select("*")
        .where({adminId: id});
    if (rows.length < 1)
        return;
    return await rows[0];
}