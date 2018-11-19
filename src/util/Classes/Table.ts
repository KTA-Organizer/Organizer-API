import Row from "./Row";
import Cell from "./Cell";

class Table {
    private body: any[];
    private width: any[];

    public constructor (width: any[]) {
        this.body = [];
        this.width = width;
    }

    public addRow(row: Row) {
        this.body.push(row);
    }
}

export default Table;