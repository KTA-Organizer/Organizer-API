import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();
import { Module } from "../models/Module";
import * as teachersService from "../services/teachers";
import * as opleidingenService from "../services/opleidingen";
import * as usersService from "../services/users";

function rowToModule(row: any): Module {
    if (row.teacher) {
        row.teacher = teachersService.fetchTeacher(row.teacher);
        row.user = usersService.fetchUser(row.user);
        row.opleiding = opleidingenService.fetchOpleiding(row.opleiding);
    }
    return row as Module;
}

export async function fetchAllModules()  {
    const rows = await knex("modules")
        .select("*")
        .map(rowToModule);
    if (rows.length < 1)
        return;
    return rows;
}

export async function fetchModule(id: number)  {
    const rows = await knex("modules")
        .select("*")
        .where({ id });
    if (rows.length < 1)
        return;
    return rowToModule(rows[0]);
}
