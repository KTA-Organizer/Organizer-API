import logger from "../util/logger";
import { User, UserRole, UserStatus } from "../models/User";
import * as studentenService from "./studenten";
import * as teachersService from "./teachers";
import * as adminsService from "./admins";
import bcrypt from "bcrypt";
import { Transaction } from "knex";

async function rowToUser(trx: Transaction, row: any) {
  if (row.accountCreatedTimestamp) {
    row.accountCreatedTimestamp = new Date(row.accountCreatedTimestamp);
  }
  const user = row as User;
  user.role = await fetchUserRole(trx, user.id);
  delete user.password;
  return user;
}

export async function fetchUserRole(trx: Transaction, id: number): Promise<UserRole> {
  if (await adminsService.isActiveAdmin(trx, id)) {
    return UserRole.admin;
  }
  if (await teachersService.isActiveTeacher(trx, id)) {
    return UserRole.teacher;
  }
  if (await studentenService.isActiveStudent(trx, id)) {
    return UserRole.student;
  }
  return undefined;
}

export async function fetchUserPasswordByEmail(trx: Transaction, email: string) {
  const rows = await trx.table("users")
    .select("password")
    .where({ email });
  if (rows.length < 1) return;
  return rows[0].password;
}

export async function fetchUser(trx: Transaction, id: number) {
  const rows = await trx.table("users")
    .select("*")
    .where({ id });
  if (rows.length < 1) return;
  return await rowToUser(trx, rows[0]);
}

export async function fetchUserByEmail(trx: Transaction, email: string) {
  const rows = await trx.table("users")
    .select("*")
    .where({ email });
  if (rows.length < 1) return;
  return await rowToUser(trx, rows[0]);
}

export async function updatePassword(trx: Transaction, userid: number, password: string) {
  const encryptedPass = await bcrypt.hash(password, 10);
  await trx.table("users")
    .update({ password: encryptedPass })
    .where("id", userid);
}

export async function activateUser(trx: Transaction, userid: number) {
  await trx.table("users")
    .update({ status: UserStatus.active })
    .where("id", userid);
}

export async function insertUser(trx: Transaction, userData: {
  firstname: string;
  lastname: string;
  email: string;
  gender: string;
}) {
  const insertedIds: number[] = await trx.table("users").insert({
    ...userData,
    status: UserStatus.waitActivation
  });
  return insertedIds[0];
}

export async function updateUser(trx: Transaction, userData: {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}) {
  await trx.table("users")
    .where({ id: userData.id })
    .update(userData);
}

export async function disableUser(trx: Transaction, id: number) {
  await trx.table("users")
    .update({ status: UserStatus.disabled })
    .where({ id });
}

export async function fetchAll(trx: Transaction, allowDisabledUsers?: boolean) {
  const filter: any = {};
  if (!allowDisabledUsers) {
    filter.status = UserStatus.active;
  }
  let rows = await trx.table("users").select("*").where(filter);
  rows = rows.map((row: any) => rowToUser(trx, row));
  return await Promise.all(rows);
}
