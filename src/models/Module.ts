import { Opleiding } from "./Opleiding";
import { Teacher } from "./Teacher";
import { User } from "./User";

export interface Module {
  id: number;
  name: string;
  opleidingId?: number;
  teacherId: number;
  creatorId?: number;

  /**
   * Optional properties which are not columns
   */
  opleiding?: Opleiding;
  teacher?: Teacher;
  creator?: User;
}