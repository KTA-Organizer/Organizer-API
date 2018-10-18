import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();


export async function fetchStudent(id: number)  {
    const rows = await knex("studenten")
        .select("*")
        .where({studentId: id});
    if (rows.length < 1)
        return;
    return rows[0];
}

export async function fetchAllStudents()  {
    const studentIds = await knex("studenten")
        .select("studentId")
        .map((dataPacket: any) => dataPacket.studentId);

    const rows = await knex("users")
        .select("*")
        .whereIn("id", studentIds);
    if (rows.length < 1)
        return;
    return rows;
}

