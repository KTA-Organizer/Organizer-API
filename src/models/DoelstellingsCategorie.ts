import { User } from "./User";
import { Module } from "./Module";
import { Doelstelling } from "./Doelstelling";

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
  doelstellingen?: Doelstelling[];
}