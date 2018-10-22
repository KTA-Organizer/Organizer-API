import logger from "../util/logger";
import getKnexInstance from "../config/db";
const knex = getKnexInstance();
import * as studentmodulesService from "../services/studentmodules";
import * as studentInviteService from "./studentInvite";
import * as usersService from "./users";

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

async function makeUserStudent(userid: number) {
    await knex("studenten").insert({ studentid: userid, stillStudent: 1 });
}

export async function insertStudent(data: { firstname: string, lastname: string, email: string }, opleidingId: number, moduleIds: number[]) {
    const userid = await usersService.insertUser(data);
    await makeUserStudent(userid);

    for (const moduleId of moduleIds) {
        await studentmodulesService.insertStudentModule({ studentId: userid, moduleId, opleidingId });
    }
    const user = await usersService.fetchUser(userid);
    await studentInviteService.inviteUser(user);
}

export async function updateStudent(data: { id: number, firstname: string, lastname: string, email: string }, opleidingId: number, moduleIds: number[]) {
    await studentmodulesService.removeStudentModule(data.id);
    for (const moduleId of moduleIds) {
        await studentmodulesService.insertStudentModule({ studentId: data.id, moduleId, opleidingId });
    }
    await usersService.updateUser(data);
}

export async function removeStudent(id: number) {
    await studentmodulesService.removeStudentModule(id);
    await knex("studenten").where({studentId: id}).del();
    await knex("access_tokens").where({userid: id}).del();
    await usersService.removeUser(id);
}