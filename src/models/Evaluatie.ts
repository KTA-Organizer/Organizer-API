import { Student } from "./Student";
import { Module } from "./Module";

export interface Evaluatie {
  id: number;
  name: string;
  studentId: number;
  moduleId: number;
  datum: Date;

  /**
   * Optional properties which are not columns
   */
  student?: Student;
  module?: Module;
}