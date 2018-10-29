import logger from "../util/logger";
import { User, UserRole, UserStatus, Gender } from "../models/User";
import * as studentenService from "./studenten";
import * as teachersService from "./teachers";
import * as adminsService from "./admins";
import bcrypt from "bcrypt";
import { Transaction } from "knex";
import { CacheMap } from "../config/caching";
import { paginate } from "../config/db";

const usersCache = new CacheMap<number, User>("users");

async function rowToUser(trx: Transaction, row: any) {
  if (row.accountCreatedTimestamp) {
    row.accountCreatedTimestamp = new Date(row.accountCreatedTimestamp);
  }
  const user = row as User;
  user.role = await fetchUserRole(trx, user.id);
  delete user.password;
  return user;
}

export async function fetchUserRole(
  trx: Transaction,
  id: number
): Promise<UserRole> {
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

export async function fetchUserPasswordByEmail(
  trx: Transaction,
  email: string
) {
  const rows = await trx
    .table("users")
    .select("password")
    .where({ email });
  if (rows.length < 1) return;
  return rows[0].password;
}

export const fetchUser = (trx: Transaction, id: number) => usersCache.wrap(id, async () => {
  const rows = await trx.table("users")
    .select("*")
    .where({ id });
  if (rows.length < 1) return;
  return await rowToUser(trx, rows[0]);
});

export async function fetchUserByEmail (trx: Transaction, email: string) {
  const rows = await trx.table("users")
    .select("*")
    .where({ email });
  if (rows.length < 1) return;
  return await rowToUser(trx, rows[0]);
}

export async function updatePassword(trx: Transaction, userid: number, password: string) {
  usersCache.changed(userid);
  const encryptedPass = await bcrypt.hash(password, 10);
  await trx
    .table("users")
    .update({ password: encryptedPass })
    .where("id", userid);
}

export async function activateUser(trx: Transaction, userid: number) {
  usersCache.changed(userid);
  await trx.table("users")
    .update({ status: UserStatus.active })
    .where("id", userid);
}

export async function insertUser(
  trx: Transaction,
  userData: {
    firstname: string;
    lastname: string;
    email: string;
    gender: string;
    role: string;
  }
) {
  const role = userData.role;
  delete userData.role;
  const insertedIds: number[] = await trx.table("users").insert({
    ...userData,
    status: UserStatus.waitActivation
  });
  const newId = insertedIds[0];
  await giveRoleToUser(trx, role, newId);
  console.log("Role inserted");
  return newId;
}

async function giveRoleToUser(trx: Transaction, role: string, newId: number) {
  let table = undefined;
  let idName = undefined;
  let stillName = undefined;
  switch (role) {
    case UserRole.admin:
      table = "admins";
      idName = "adminId";
      stillName = "stillAdmin";
      break;
    case UserRole.student:
      table = "studenten";
      idName = "studentId";
      stillName = "stillStudent";
      break;
    case UserRole.teacher:
      table = "teachers";
      idName = "teacherId";
      stillName = "stillTeacher";
      break;
    default:
      throw new Error("This role doesn't exist!");
  }
  console.log(table, role, idName, stillName);
  const roleObject = { [idName]: newId, [stillName]: 1 };
  console.log(roleObject);
  if (table && idName && stillName) {
    await trx.table(table).insert(roleObject);
  }
}

export async function updateUser(
  trx: Transaction,
  userData: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  }
) {
  usersCache.changed(userData.id);
  await trx
    .table("users")
    .where({ id: userData.id })
    .update(userData);
}

export async function disableUser(trx: Transaction, id: number) {
  usersCache.changed(id);
  await trx.table("users")
    .update({ status: UserStatus.disabled })
    .where({ id });
}

export async function fetchAll(trx: Transaction, allowDisabledUsers?: boolean) {
  const filter: any = {};
  if (!allowDisabledUsers) {
    filter.status = UserStatus.active;
  }
  let rows = await trx
    .table("users")
    .select("*")
    .where(filter);
  rows = rows.map((row: any) => rowToUser(trx, row));
  return await Promise.all(rows);
}

export type FetchUsersOptions = {
  allowDisabledUsers?: boolean,
  page: number,
  perPage: number,
  gender?: Gender,
  role?: UserRole
};

export async function paginateAllUsers(trx: Transaction, options: FetchUsersOptions) {
  const filter: any = {};
  if (!options.allowDisabledUsers) {
    filter.status = UserStatus.active;
  }
  if (!options.gender) {
    filter.gender = options.gender;
  }
  const paginator = await paginate<User>(trx
    .table("users")
    .select("*")
    .where(filter))(options.page, options.perPage);
  const promises = paginator.rows
    .map((row: any) => rowToUser(trx, row));
  paginator.rows = await Promise.all(promises);
  if (!options.role) {
    paginator.rows = paginator.rows
      .filter((row) => row.role === options.role);
  }
  return paginator;
}