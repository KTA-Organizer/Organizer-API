import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();
import * as studentmodulesService from "../services/studentmodules";

async function rowToStudentWithOpleiding(row: any) {
    const studentModule = await studentmodulesService.fetchStudentModulesWithStudentId(row.id);
    console.log(studentModule + "        "  + row.id);
    if (studentModule === undefined) {
        return row;
    }
    if ((studentModule as any).opleidingId) {
        row.opleidingId = (studentModule as any).opleidingId;
    }
    return await row;
}

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
        .whereIn("id", studentIds)
        .map(student => rowToStudentWithOpleiding(student));

    if (rows.length < 1)
        return;
    return rows;
}

