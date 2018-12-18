import logger from "../util/logger";
import { User, UserRole, UserStatus, Gender, userRoles } from "../models/User";
import * as userRolesService from "./userRoles";
import bcrypt from "bcrypt";
import { Transaction } from "knex";
import { paginate, PaginateResult } from "../config/db";
import * as invitesService from "./invites";
import * as accessTokenService from "./accessTokens";
import _ from "lodash";

function rowToUser(row: any) {
  if (!row) {
    return;
  }
  const user = row as User;
  user.roles = userRoles
    .filter(role => row[role.toLowerCase()]);
  user.role = user.roles[0];

  for (const role of user.roles) {
    delete row[role.toLowerCase()];
  }

  delete user.password;
  return user;
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

const getUserQuery = (trx: Transaction) => trx
  .table("users")
  .select("users.*", "students.userid", "teachers.userid", "admins.userid", "staff.userid", "teachers.active as teacher", "students.active as student", "admins.active as admin", "staff.active as staff")
  .leftJoin("teachers", "users.id", "teachers.userid")
  .leftJoin("students", "users.id", "students.userid")
  .leftJoin("admins", "users.id", "admins.userid")
  .leftJoin("staff", "users.id", "staff.userid");

export async function fetchUser(trx: Transaction, id: number) {
  const row = await getUserQuery(trx)
    .where({ id })
    .first();
  return rowToUser(row);
}

export async function fetchUsers(trx: Transaction, ids: number[]) {
  const rows = await getUserQuery(trx)
    .whereIn("id", ids);
  return rows.map(rowToUser);
}

export async function fetchUserByEmail(trx: Transaction, email: string) {
  const row = await getUserQuery(trx)
    .where({ email })
    .first();
  return rowToUser(row);
}

export async function updatePassword(trx: Transaction, userid: number, password: string) {
  const encryptedPass = await bcrypt.hash(password, 10);
  await trx
    .table("users")
    .update({ password: encryptedPass })
    .where("id", userid);
}

export async function activateUser(trx: Transaction, userid: number) {
  await trx.table("users")
    .update({ status: UserStatus.active })
    .where("id", userid);
}

export interface InsertUser {
  firstname: string;
  lastname: string;
  email: string;
  gender: Gender;
  roles: UserRole[];
  creatorId: number;
  nationalRegisterNumber: string;
}

export async function insertUser(
  trx: Transaction,
  { roles, ...userData }: InsertUser
) {
  const insertedIds: number[] = await trx.table("users").insert({
    ...userData,
    status: UserStatus.waitActivation
  });
  const userid = insertedIds[0];
  await userRolesService.updateUserRoles(trx, userid, roles);

  const newUser = await fetchUser(trx, userid);

  await invitesService.inviteUser(trx, newUser);

  return newUser;
}

export async function updateUser(
  trx: Transaction,
  id: number,
  { roles, ...userData }: InsertUser,
  shouldUpdateRoles?: boolean
) {
  await trx
    .table("users")
    .where("id", id)
    .update(userData);
  if (shouldUpdateRoles) {
    await userRolesService.updateUserRoles(trx, id, roles);
  }
}

export async function disableUser(trx: Transaction, id: number) {
  await trx.table("users")
    .update({ status: UserStatus.disabled })
    .where({ id });
  await accessTokenService.deleteAccessTokensForUser(trx, id);
}

export type FetchUsersOptions = {
  page: number,
  perPage: number,
  search?: string;
  status?: UserStatus,
  gender?: Gender,
  role?: UserRole,
  disciplineid?: number
};

export async function paginateAllUsers(trx: Transaction, options: FetchUsersOptions) {
  const query = getUserQuery(trx);

  if (options.gender) {
    query.where("gender", options.gender);
  }
  if (options.status) {
    query.where("status", options.status);
  }
  if (options.role) {
    const s = options.role.toLowerCase() === "staff" ? "" : "s";
    const ids = await trx.table(`${options.role.toLowerCase()}${s}`).select("userid");
    const userids = ids.map((x: any) => x.userid);
    query.whereIn("users.id", userids).andWhere(`${options.role.toLowerCase()}${s}.active`, true);
  }
  if (options.disciplineid) {
    const ids = await trx.table("student_disciplines")
      .pluck("studentid")
      .where("disciplineid", options.disciplineid);
    query.whereIn("users.id", ids);
  }
  if (options.search) {
    query.whereRaw("CONCAT(firstname, ' ', lastname) LIKE CONCAT('%', ?, '%')", [options.search]);
  }
  const paginator: PaginateResult<User> = await paginate(query)(options.page, options.perPage);
  paginator.items = paginator.items
    .map(rowToUser);
  return paginator;
}

export function hasRole(user: User, role: UserRole) {
  return user.roles.indexOf(role) > -1;
}