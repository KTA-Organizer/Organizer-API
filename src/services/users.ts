import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();
import { User, UserRole } from "../models/User";
import * as studentenService from "./studenten";
import * as teachersService from "./teachers";
import * as adminsService from "./admins";
import bcrypt from "bcrypt";

async function rowToUser(row: any) {
  if (row.accountCreatedTimestamp) {
    row.accountCreatedTimestamp = new Date(row.accountCreatedTimestamp);
  }
  const user = row as User;
  user.role = await fetchUserRole(user.id);
  return user;
}

export async function fetchUserRole(id: number): Promise<UserRole> {
  if (await studentenService.fetchStudent(id)) {
    return UserRole.student;
  }
  if (await teachersService.fetchTeacher(id)) {
    return UserRole.teacher;
  }
  if (await adminsService.fetchAdmin(id)) {
    return UserRole.admin;
  }
  return undefined;
}

export async function fetchUser(id: number)  {
  const rows = await knex("users")
    .select("*")
    .where({ id });
  if (rows.length < 1)
    return;
  return await rowToUser(rows[0]);
}

export async function fetchUserByEmail(email: string)  {
    const rows = await knex("users")
        .select("*")
        .where({ email });
    if (rows.length < 1)
        return;
    return await rowToUser(rows[0]);
}

export async function updatePassword(userid: number, password: string) {
  const encryptedPass = await bcrypt.hash(password, 10);
  await knex("users").update({ password: encryptedPass }).where("id", userid);
}