class PDF {
  private content: any[];
private styles: {};
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

  addContent(item: any) {
    this.content.push(item);
  }
}

export default PDF;