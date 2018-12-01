export interface IItem {
    toJson(): any;
}

export class Item implements IItem {
    content: any;
    constructor(content: any) {
        this.content = content;
    }

    public toJson() {
        return this.content;
    }
}

export default IItem;