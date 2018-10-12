import { Module } from "./Module";
import { Student } from "./Student";
import { Opleiding } from "./Opleiding";

export enum StudentModuleStatus {
  volgt = "Volgt",
  beeindigd = "Beëindigd"
}
export interface StudentModule {
  moduleId: number;
  studentId: number;
  opleidingId?: number;
  status: StudentModuleStatus;

  /**
   * Optional properties which are not columns
   */
  module?: Module;
  student?: Student;
  opleiding?: Opleiding;
}