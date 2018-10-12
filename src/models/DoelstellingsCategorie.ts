import { User } from "./User";
import { Module } from "./Module";

export interface DoelstellingsCategorie {
  id: number;
  name: string;
  moduleId: number;
  inGebruik: boolean;
  creatorId?: number;

  /**
   * Optional properties which are not columns
   */
  module?: Module;
  creator?: User;
}