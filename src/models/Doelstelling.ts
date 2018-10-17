import { DoelstellingsCategorie } from "./DoelstellingsCategorie";
import { User } from "./User";
import { EvaluatieCriteria } from "./EvaluatieCriteria";

export interface Doelstelling {
  id: number;
  doelstellingscategorieId: number;
  name: string;
  inGebruik: boolean;
  creatorId?: number;

  /**
   * Optional properties which are not columns
   */
  doelstellingscategorie?: DoelstellingsCategorie;
  creator?: User;
  EvaluatieCriteria?: EvaluatieCriteria[];
}