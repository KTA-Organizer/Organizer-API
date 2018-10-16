import { User } from "./User";
import { Opleiding } from "./Opleiding";
import { Module } from "./Module";

export class OpleidingVolledig {
  opleiding: Opleiding;
  modules: Module[];

  constructor(opleiding: Opleiding, modules: Module[]) {
    this.opleiding = opleiding;
    this.modules = modules;
  }
}
