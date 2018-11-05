import { User } from "./User";
import { Opleiding } from "./Opleiding";

export interface Melding {
  id: number;
  creatorId: number;
  titel?: string;
  tekst: string;
  datum: Date;

  /**
   * Optional properties which are not columns
   */
  creator?: User;
  opleidingen?: Opleiding[];
}