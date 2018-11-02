import logger from "../util/logger";
import { Transaction } from "knex";
import * as studentmodulesService from "../services/studentmodules";
import * as usersService from "./users";

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

export async function makeUserStudent(trx: Transaction, id: number) {
    await trx.table("studenten").insert({ studentId: id, stillStudent: 1 });
}

export async function makeUserNotStudent(trx: Transaction, id: number) {
    await trx.table("studenten").update({ stillStudent: 0 }).where("studentId", id);
}

export async function updateStudent(trx: Transaction, userid: number, opleidingId: number, moduleIds: number[]) {
    await studentmodulesService.removeStudentModules(trx, userid);
    for (const moduleId of moduleIds) {
        await studentmodulesService.insertStudentModule(trx, { studentId: userid, moduleId, opleidingId });
    }
}