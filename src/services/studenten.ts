import logger from "../util/logger";
import { Transaction } from "knex";
import * as studentmodulesService from "../services/studentmodules";
import * as studentInviteService from "./studentInvite";
import * as usersService from "./users";

async function rowToStudentWithOpleiding(trx: Transaction, row: any) {
    const studentModule = await studentmodulesService.fetchStudentModulesWithStudentId(trx, row.id);
    if (studentModule === undefined) {
        return row;
    }
    if ((studentModule as any).opleidingId) {
        row.opleidingId = (studentModule as any).opleidingId;
    }
    return await row;
}

export async function fetchStudent(trx: Transaction, id: number)  {
    const rows = await trx.table("studenten")
        .select("*")
        .where({studentId: id});
    if (rows.length < 1)
        return;
    return rows[0];
}

export async function isActiveStudent(trx: Transaction, id: number)  {
    const rows = await trx.table("studenten")
        .select("*")
        .where({studentId: id, stillStudent: 1});
    return rows.length > 0;
}

export async function fetchAllStudents(trx: Transaction)  {
    const studentIds = await trx.table("studenten")
        .select("studentId")
        .map((dataPacket: any) => dataPacket.studentId);

    const rows = await trx.table("users")
        .select("*")
        .whereIn("id", studentIds)
        .map(student => rowToStudentWithOpleiding(trx, student));

    if (rows.length < 1)
        return;
    return rows;
}

async function makeUserStudent(trx: Transaction, userid: number) {
    await trx.table("studenten").insert({ studentid: userid, stillStudent: 1 });
}

export async function insertStudent(trx: Transaction, data: { firstname: string, lastname: string, email: string }, opleidingId: number, moduleIds: number[]) {
    const userid = await usersService.insertUser(trx, data);
    await makeUserStudent(trx, userid);

    for (const moduleId of moduleIds) {
        await studentmodulesService.insertStudentModule(trx, { studentId: userid, moduleId, opleidingId });
    }

    const user = await usersService.fetchUser(trx, userid);
    await studentInviteService.inviteUser(trx, user);
}

export async function updateStudent(trx: Transaction, data: { id: number, firstname: string, lastname: string, email: string }, opleidingId: number, moduleIds: number[]) {
    await studentmodulesService.removeStudentModules(trx, data.id);
    for (const moduleId of moduleIds) {
        await studentmodulesService.insertStudentModule(trx, { studentId: data.id, moduleId, opleidingId });
    }
    await usersService.updateUser(trx, data);
}

export async function disableStudent(trx: Transaction, id: number) {
    await studentmodulesService.removeStudentModules(trx, id);

    await trx.table("studenten").update({
        stillStudent: 0
    }).where({studentId: id});

    await trx.table("access_tokens").where({userid: id}).del();

    await usersService.disableUser(trx, id);
}