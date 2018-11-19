import Cell from "./Cell";

class Row {
    private cells: Cell[];

    public addCell(text: string = "", style: string = "", colSpan: number = 1) {
        this.cells.push({text, style, colSpan});
    }
}

export default Row;
