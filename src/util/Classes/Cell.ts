import { IItem, Item } from "./Item";

class Cell implements IItem {
  private content: IItem;
  private child: boolean;

  public constructor(content: any, child: boolean = false) {
    this.content = child ? content : new Item(content);
    this.child = child;
  }

  public toJson() {
    return this.content.toJson();
  }
}

export default Cell;
