export enum Gender {
  male = "M",
  female = "F",
}

export const genders = [Gender.male, Gender.female];

export enum UserStatus {
  waitActivation = "WAIT_ACTIVATION",
  active = "ACTIVE",
  disabled = "DISABLED",
}

export const userStatuses = [UserStatus.waitActivation, UserStatus.active, UserStatus.disabled];

export enum UserRole {
  student = "STUDENT",
  teacher = "TEACHER",
  admin = "ADMIN",
  staff = "STAFF"
}

export const userRoles = [UserRole.admin, UserRole.staff, UserRole.teacher, UserRole.student];

export interface User {
  id: number;
  email?: string;
  firstname: string;
  lastname: string;
  password?: string;
  gender?: Gender;
  status: UserStatus;
  creation: Date;
  creatorId?: number;
  nationalRegisterNumber?: string;

  /**
   * Optional properties which are not columns
   */
  creator?: User;
  role?: UserRole;
  roles?: UserRole[];
}