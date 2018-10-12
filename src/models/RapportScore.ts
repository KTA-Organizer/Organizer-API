import { Rapport } from "./Rapport";
import { Score } from "./Score";
import { Doelstelling } from "./Doelstelling";

export interface RapportScore {
  rapportId: number;
  doelstellingId: number;
  score: Score;
  opmerking?: string;

  /**
   * Optional properties which are not columns
   */
  rapport?: Rapport;
  doelstelling?: Doelstelling;
}