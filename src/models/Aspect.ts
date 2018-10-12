import { User } from "./User";
import { EvaluatieCriteria } from "./EvaluatieCriteria";

export interface Aspect {
  id: number;
  evaluatiecriteriumId: number;
  name: string;
  inGebruik: boolean;
  gewicht: number;
  creatorId?: number;

  /**
   * Optional properties which are not columns
   */
  evaluatiecriterium?: EvaluatieCriteria;
  creator?: User;
}