import { Rapport } from "./Rapport";
import { Module } from "./Module";

export interface RapportModule {
  rapportId: number;
  moduleId: number;
  commentaar?: string;

  /**
   * Optional properties which are not columns
   */
  rapport?: Rapport;
  module?: Module;
}