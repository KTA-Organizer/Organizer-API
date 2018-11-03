import logger from "../util/logger";
import { User, UserRole, UserStatus, Gender, userRoles } from "../models/User";
import * as studentenService from "./studenten";
import * as teachersService from "./teachers";
import * as adminsService from "./admins";
import bcrypt from "bcrypt";
import { Transaction } from "knex";
import { CacheMap } from "../config/caching";
import { paginate, PaginateResult } from "../config/db";
import * as invitesService from "./invites";
import * as accessTokenService from "./accessTokens";
import _ from "lodash";

const usersCache = new CacheMap<number, User>("users");

function rowToUser(row: any) {
  if (row.accountCreatedTimestamp) {
    row.accountCreatedTimestamp = new Date(row.accountCreatedTimestamp);
  }
  const user = row as User;
  user.roles = [];

  if (row.stillStudent) {
    user.roles.push(UserRole.student);
  }
  if (row.stillAdmin) {
    user.roles.push(UserRole.admin);
  }
  if (row.stillTeacher) {
    user.roles.push(UserRole.teacher);
  }
  delete row.stillStudent;
  delete row.stillAdmin;
  delete row.stillTeacher;

  user.role = user.roles[0];
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
  .select("users.*", "teachers.stillTeacher", "studenten.stillStudent", "admins.stillAdmin")
  .leftJoin("teachers", "users.id", "teachers.teacherId")
  .leftJoin("studenten", "users.id", "studenten.studentId")
  .leftJoin("admins", "users.id", "admins.adminId");

export const fetchUser = (trx: Transaction, id: number) => usersCache.wrap(id, async () => {
  const row = await getUserQuery(trx)
    .where({ id })
    .first();
  if (!row) return;
  return rowToUser(row);
});

export async function fetchUserByEmail (trx: Transaction, email: string) {
  const row = await getUserQuery(trx)
    .where({ email })
    .first();
  if (!row) return;
  return rowToUser(row);
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
  const rows = await getUserQuery(trx)
    .where(filter);
  return rows.map(rowToUser);
}

export type FetchUsersOptions = {
  page: number,
  perPage: number,
  search?: string;
  status?: UserStatus,
  gender?: Gender,
  role?: UserRole
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
    const key = {
      [UserRole.admin]: "stillAdmin",
      [UserRole.teacher]: "stillTeacher",
      [UserRole.student]: "stillStudent",
    }[options.role];
    query.where(key, 1);
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