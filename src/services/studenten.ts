import logger from "../util/logger";
import { getKnex } from "../config/db";
import * as studentmodulesService from "../services/studentmodules";
import * as studentInviteService from "./studentInvite";
import * as usersService from "./users";

async function rowToStudentWithOpleiding(row: any) {
    const studentModule = await studentmodulesService.fetchStudentModulesWithStudentId(row.id);
    if (studentModule === undefined) {
        return row;
    }
    if ((studentModule as any).opleidingId) {
        row.opleidingId = (studentModule as any).opleidingId;
    }
    return await row;
}

export async function fetchStudent(id: number)  {
    const knex = await getKnex();
    const rows = await knex("studenten")
        .select("*")
        .where({studentId: id});
    if (rows.length < 1)
        return;
    return rows[0];
}

export async function isActiveStudent(id: number)  {
    const knex = await getKnex();
    const rows = await knex("studenten")
        .select("*")
        .where({studentId: id, stillStudent: 1});
    return rows.length > 0;
}

export async function fetchAllStudents()  {
    const knex = await getKnex();
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
    const knex = await getKnex();
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

export async function disableStudent(id: number) {
    const knex = await getKnex();
    await studentmodulesService.removeStudentModule(id);

    await knex("studenten").update({
        stillStudent: 0
    }).where({studentId: id});

    await knex("access_tokens").where({userid: id}).del();

    await usersService.disableUser(id);
}