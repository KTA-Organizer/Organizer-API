import { Doelstelling } from "./Doelstelling";
import { User } from "./User";
import { Aspect } from "./Aspect";

export interface EvaluatieCriteria {
  id: number;
  doestellingId: number;
  name: string;
  gewicht: number;
  inGebruik: boolean;
  creatorId?: number;

  /**
   * Optional properties which are not columns
   */
  doelstelling?: Doelstelling;
  creator?: User;
  aspecten?: Aspect[];
}