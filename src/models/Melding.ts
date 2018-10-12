import { Teacher } from "./Teacher";

export interface Melding {
  id: number;
  teacherId: number;
  titel?: string;
  tekst: string;
  datum: Date;

  /**
   * Optional properties which are not columns
   */
  teacher?: Teacher;
}