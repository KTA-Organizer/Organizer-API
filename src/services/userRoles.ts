import logger from "../util/logger";
import _ from "lodash";
import { Transaction } from "knex";
import { UserRole, userRoles } from "../models/User";

const userRoleTable = {
    [UserRole.admin]: "admins",
    [UserRole.staff]: "staff",
    [UserRole.teacher]: "teachers",
    [UserRole.student]: "students",
};

export async function makeUserRole(trx: Transaction, userid: number, role: UserRole) {
    try {
      await trx.table(userRoleTable[role]).insert({ userid: userid, active: 1 });
    } catch (err) {
      await trx.table(userRoleTable[role]).update({ active: 1 }).where({ userid: userid, });
    }
}

export async function makeUserNotRole(trx: Transaction, userid: number, role: UserRole) {
    await trx.table(userRoleTable[role]).update({ active: 0 }).where("userid", userid);
}

export async function updateUserRoles(trx: Transaction, userid: number, roles: UserRole[]) {
  for (const role of userRoles) {
    if (_.includes(roles, role)) {
      await makeUserRole(trx, userid, role);
    } else {
      await makeUserNotRole(trx, userid, role);
    }
  }
}
