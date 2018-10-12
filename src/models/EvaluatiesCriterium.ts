import { Evaluatie } from "./Evaluatie";
import { Score } from "./Score";

export interface EvaluatiesCriterium {
  id: number;
  evaluatieId: number;
  criteriumId: number;

  /**
   * Optional properties which are not columns
   */
  evaluatie?: Evaluatie;
  criteriumBeoordeling?: Score;
}