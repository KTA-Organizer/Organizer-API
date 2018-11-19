import Row from "./Row";
import Cell from "./Cell";
import * as Constants from "./Constants";
import IItem from "./Item";
import { timesSeries } from "async";

class Table implements IItem {
  private body: Row[];
  private widths: any[];
  private heights: any[];

  public constructor(widths?: any[], heights?: any[]) {
    this.body = [];
    this.widths = widths ? widths : new Array(1).fill(Constants.defaultWidth);
    this.heights = heights
      ? heights
      : new Array(this.widths.length).fill(Constants.defaultHeight);
  }

  public addRow(row: Row) {
    this.body.push(row);
  }
  public toJson() {
    const jsonBody: any = [];
    this.body.forEach((row: Row) => jsonBody.push(row.toJson()));
    const obj = {
      table: {
        widths: this.widths,
        heights: this.heights,
        body: jsonBody
      }
    };
    return obj;
  }
}

export default Table;
