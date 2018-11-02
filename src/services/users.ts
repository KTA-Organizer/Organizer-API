import logger from "../util/logger";
import { User, UserRole, UserStatus, Gender, userRoles } from "../models/User";
import * as studentenService from "./studenten";
import * as teachersService from "./teachers";
import * as adminsService from "./admins";
import bcrypt from "bcrypt";
import { Transaction } from "knex";
import { CacheMap } from "../config/caching";
import { paginate } from "../config/db";
import * as invitesService from "./invites";
import * as accessTokenService from "./accessTokens";
import _ from "lodash";

const usersCache = new CacheMap<number, User>("users");

async function rowToUser(trx: Transaction, row: any) {
  if (row.accountCreatedTimestamp) {
    row.accountCreatedTimestamp = new Date(row.accountCreatedTimestamp);
  }
  const user = row as User;
  user.roles = await fetchUserRoles(trx, user.id);
  user.role = user.roles[0];
  delete user.password;
  return user;
}

export async function fetchUserRoles(trx: Transaction, id: number) {
  const roles: UserRole[] = [];
  const roleOptions = [UserRole.admin, UserRole.teacher, UserRole.student];
  const results = await Promise.all([
    adminsService.isActiveAdmin(trx, id),
    teachersService.isActiveTeacher(trx, id),
    studentenService.isActiveStudent(trx, id),
  ]);
  results.forEach((isRole, i) =>
    isRole && roles.push(roleOptions[i]));
  return roles;
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
  { roles, ...userData }: {
    firstname: string;
    lastname: string;
    email: string;
    gender: Gender;
    roles: UserRole[];
  }
) {
  const insertedIds: number[] = await trx.table("users").insert({
    ...userData,
    status: UserStatus.waitActivation
  });
  const userid = insertedIds[0];
  await updateUserRoles(trx, userid, roles);

  const newUser = await fetchUser(trx, userid);

  await invitesService.inviteUser(trx, newUser);

  return newUser;
}

async function updateUserRoles(trx: Transaction, userid: number, roles: UserRole[]) {
  const addRoleFuns = {
    [UserRole.admin]: adminsService.makeUserAdmin,
    [UserRole.teacher]: teachersService.makeUserTeacher,
    [UserRole.student]: studentenService.makeUserStudent,
  };
  const removeRoleFuns = {
    [UserRole.admin]: adminsService.makeUserNotAdmin,
    [UserRole.teacher]: teachersService.makeUserNotTeacher,
    [UserRole.student]: studentenService.makeUserNotStudent,
  };
  for (const role of userRoles) {
    if (_.includes(roles, role)) {
      await addRoleFuns[role](trx, userid);
    } else {
      await removeRoleFuns[role](trx, userid);
    }
  }
}

export async function updateUser(
  trx: Transaction,
  id: number,
  {roles, ...userData}: {
    firstname: string;
    lastname: string;
    email: string;
    gender: Gender,
    roles?: UserRole[]
  },
  shouldUpdateRoles?: boolean
) {
  await trx
    .table("users")
    .where("id", id)
    .update(userData);
  if (shouldUpdateRoles) {
    await updateUserRoles(trx, id, roles);
  }
  usersCache.changed(id);
}

export async function disableUser(trx: Transaction, id: number) {
  usersCache.changed(id);
  await trx.table("users")
    .update({ status: UserStatus.disabled })
    .where({ id });
  await accessTokenService.deleteAccessTokensForUser(trx, id);
}

export async function fetchAll(trx: Transaction, allowDisabledUsers?: boolean) {
  const filter: any = {};
  if (!allowDisabledUsers) {
    filter.status = UserStatus.active;
  }
  const rows = await trx
    .table("users")
    .select("*")
    .where(filter);
  const promises: Promise<User>[] = rows.map((row: any) => rowToUser(trx, row));
  return await Promise.all(promises);
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

export function hasRole(user: User, role: UserRole) {
  return user.roles.indexOf(role) > -1;
}