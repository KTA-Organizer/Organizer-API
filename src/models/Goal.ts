import { Criterion } from "./Criterion";

export interface Goal {
  id: number;
  name: string;
  domainid: number;
  creation: Date;

  criteria?: Criterion[];
}