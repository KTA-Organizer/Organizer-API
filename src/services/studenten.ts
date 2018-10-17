import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();


export async function fetchStudent(id: number)  {
    const rows = await knex("studenten")
        .select("*")
        .where({studentId: id});
    if (rows.length < 1)
        return;
    return await rows[0];
}
