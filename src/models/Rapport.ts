import { Student } from "./Student";

export interface Rapport {
  id: number;
  studentId: number;
  name: string;
  class?: string;
  startdate: Date;
  enddate: Date;
  commentaarKlassenraad?: string;
  commentaarAlgemeen?: string;
  commentaarWerkplaats?: string;

  /**
   * Optional properties which are not columns
   */
  student?: Student;
}