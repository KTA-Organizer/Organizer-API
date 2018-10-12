import { Evaluatie } from "./Evaluatie";
import { Aspect } from "./Aspect";

export interface EvaluatieAspect {
  id: number;
  evaluatieId: number;
  aspectId: number;
  aspectBeoordeling: boolean;

  /**
   * Optional properties which are not columns
   */
  evaluatie?: Evaluatie;
  aspect?: Aspect;
}