import IItem from "./Item";
import Table from "./Table";

class PDF {
  private content: IItem[];
  public static STYLES = {
    tableheader: {
      fontSize: 18,
      bold: true,
      fillColor: "#eeeeee"
    },
    header: {
      fontSize: 18,
      bold: true,
      margin: [0, 10, 0, 5],
      border: [false, false, false, false]
    },
    subheader: {
      fontSize: 15,
      margin: [0, 10, 0, 5],
      border: [false, false, false, false]
    },
    info_right: {
      alignment: "right"
    },
    info_left: {
      alignment: "left"
    }
  };

  public constructor() {
    this.content = [];
  }

  public addContent(item: IItem) {
    this.content.push(item);
  }

  public toJson() {
    const obj: any = { content: [] };
    this.content.forEach((item: IItem) => {
        obj.content.push(item.toJson());
    });
    obj.styles = PDF.STYLES;
    return obj;
  }
}

export default PDF;
