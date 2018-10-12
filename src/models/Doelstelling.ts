import { DoelstellingsCategorie } from "./DoelstellingsCategorie";
import { User } from "./User";

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
}