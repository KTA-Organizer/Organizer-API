import Cell from "./Cell";
import IItem from "./Item";

class Row implements IItem {
  private cells: Cell[];

  public constructor() {
    this.cells = [];
  }

  public addCell(cell: Cell) {
    this.cells.push(cell);
  }

  public toJson() {
    const cells: any = [];
    this.cells.forEach(cell => cells.push(cell.toJson()));
    return cells;
  }
}

export default Row;
