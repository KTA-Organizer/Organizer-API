import { Request, Response, NextFunction } from "express";
import { HttpError } from "../util/httpStatus";
import { User, UserRole } from "../models/User";
import { errorResponse } from "../routers/executor";

export function usersOnly(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    next();
  } else {
    errorResponse(new HttpError(401, "Only users are allowed"), res);
  }
}

const roleFilterMiddlewareFactory = (requiredRole: UserRole) => (req: Request, res: Response, next: NextFunction) => {
  usersOnly(req, res, (err) => {
    const user = req.user as User;
    if (user.role === requiredRole) {
      next();
    } else {
      errorResponse(new HttpError(401, `Only users of role: ${requiredRole} are allowed`), res);
    }
  });
};

export const studentsOnly = roleFilterMiddlewareFactory(UserRole.student);
export const teachersOnly = roleFilterMiddlewareFactory(UserRole.teacher);
export const adminsOnly = roleFilterMiddlewareFactory(UserRole.admin);

type Filter = (user: User) => Promise<boolean>;
export const filteredOnly = (predicate: Filter, errorMessage: string) => async (req: Request, res: Response, next: NextFunction) => {
  if (await predicate(req.user as User)) {
    next();
  } else {
    errorResponse(new HttpError(401, errorMessage), res);
  }
};