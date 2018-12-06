import { Request, Response, NextFunction } from "express";
import { HttpError } from "../util/httpStatus";
import { User, UserRole, UserStatus } from "../models/User";
import { errorResponse } from "./executor";
import _ from "lodash";

export function unauthenticatedOnly(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    errorResponse(new HttpError(403, "Please logout first"), res);
  } else {
    next();
  }
}
export function usersOnly(req: Request, res: Response, next: NextFunction) {
  const currentUser = req.user as User;
  if (currentUser && currentUser.status === UserStatus.active) {
    next();
  } else {
    errorResponse(new HttpError(401, "Only users are allowed"), res);
  }
}

const roleFilterMiddlewareFactory = (hasOneOf: UserRole[]) => (req: Request, res: Response, next: NextFunction) => {
  usersOnly(req, res, (err) => {
    const user = req.user as User;
    if (_.intersection(user.roles, hasOneOf).length > 0) {
      next();
    } else {
      errorResponse(new HttpError(403, `Only users of roles: ${hasOneOf.join(", ")} are allowed`), res);
    }
  });
};

export const studentsOnly = roleFilterMiddlewareFactory([UserRole.student]);
export const teachersOnly = roleFilterMiddlewareFactory([UserRole.teacher]);
export const adminsOnly = roleFilterMiddlewareFactory([UserRole.admin]);

export const allStaffOnly = roleFilterMiddlewareFactory([UserRole.admin, UserRole.teacher, UserRole.staff]);

type Filter = (user: User) => Promise<boolean>;
export const filteredOnly = (predicate: Filter, errorMessage: string) => async (req: Request, res: Response, next: NextFunction) => {
  if (await predicate(req.user as User)) {
    next();
  } else {
    errorResponse(new HttpError(401, errorMessage), res);
  }
};