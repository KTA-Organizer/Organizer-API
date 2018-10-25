import logger from "../util/logger";
import { getKnex } from "../config/db";


export async function isActiveTeacher(id: number)  {
    const knex = await getKnex();
    const rows = await knex("teachers")
        .select("*")
        .where({teacherId: id, stillTeacher: 1});
    return rows.length > 0;
}