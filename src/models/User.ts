export enum Gender {
  male = "M",
  female = "F",
}

export enum Language {
  dutch = "NL",
  english = "EN"
}

export enum UserStatus {
  waitActivation = "WAIT_ACTIVATION",
  active = "ACTIVE",
  disabled = "DISABLED",
}

export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  gender: Gender;
  language: Language;
  activationKey?: string;
  status: UserStatus;
  accountCreatedTimestamp: Date;
  resetcode?: string;
  creatorId?: number;

  /**
   * Optional properties which are not columns
   */
  creator?: User;
}