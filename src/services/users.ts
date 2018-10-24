import logger from "../util/logger";
import { getKnex } from "../config/db";
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
  delete user.password;
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

export async function fetchUserPasswordByEmail(email: string) {
  const knex = await getKnex();
  const rows = await knex("users")
    .select("password")
    .where({ email });
  if (rows.length < 1) return;
  return rows[0].password;
}

export async function fetchUser(id: number) {
  const knex = await getKnex();
  const rows = await knex("users")
    .select("*")
    .where({ id });
  if (rows.length < 1) return;
  return await rowToUser(rows[0]);
}

export async function fetchUserByEmail(email: string) {
  const knex = await getKnex();
  const rows = await knex("users")
    .select("*")
    .where({ email });
  if (rows.length < 1) return;
  return await rowToUser(rows[0]);
}

export async function updatePassword(userid: number, password: string) {
  const knex = await getKnex();
  const encryptedPass = await bcrypt.hash(password, 10);
  await knex("users")
    .update({ password: encryptedPass })
    .where("id", userid);
}

export async function insertUser(userData: {
  firstname: string;
  lastname: string;
  email: string;
}) {
  const knex = await getKnex();
  const insertedIds: number[] = await knex("users").insert(userData);
  return insertedIds[0];
}

export async function updateUser(userData: {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}) {
  const knex = await getKnex();
  await knex("users")
    .where({ id: userData.id })
    .update(userData);
}

export async function removeUser(id: number) {
  const knex = await getKnex();
  await knex("users")
    .where({ id })
    .del();
}