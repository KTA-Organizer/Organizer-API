import { Report } from "../models/Report";
import * as Canvas from "canvas";
import { Module } from "../models/Module";
import { User } from "../models/User";

const writeRotatedText = function(text: string) {
  const canvas = Canvas.createCanvas(40, 500);
  const ctx = canvas.getContext("2d");
  ctx.font = "bold 42px Arial";
  ctx.save();
  ctx.translate(canvas.width, canvas.height);
  ctx.rotate(-0.5 * Math.PI);
  ctx.fillStyle = "#000";
  ctx.fillText(text, 0, 0);
  ctx.restore();
  return canvas.toDataURL();
};

const styles = {
  tableheader: {
    fontSize: 18,
    bold: true,
    fillColor: "#eeeeee"
  },
  header: {
    fontSize: 18,
    bold: true,
    margin: [0, 10, 0, 5]
  },
  subheader: {
    fontSize: 15,
    margin: [0, 10, 0, 5]
  },
  info_right: {
    alignment: "right"
  },
  info_left: {
    alignment: "left"
  }
};

const scoreHeader = {
  table: {
    widths: ["*", 25, 25, 25, 25, "*"],
    heights: [100, 100, 100, 100, 100, 100],
    body: [
      [
        {
          text: "Vakken",
          style: "tableheader"
        },
        {
          image: writeRotatedText("GOED"),
          fit: [25, 100],
          alignment: "center",
          style: "tableheader"
        },
        {
          image: writeRotatedText("VOLDOENDE"),
          fit: [25, 100],
          alignment: "center",
          style: "tableheader"
        },
        {
          image: writeRotatedText("ONVOLDOENDE"),
          fit: [25, 100],
          alignment: "center",
          style: "tableheader"
        },
        {
          image: writeRotatedText("RUIM ONVOLDOENDE"),
          fit: [25, 100],
          alignment: "center",
          style: "tableheader"
        },
        {
          text: "Opmerking",
          style: "tableheader"
        }
      ]
    ]
  }
};

function createHeaderObject(student: User, module: Module) {
  const headerObject: any = {layout: "noBorders"};
  headerObject["table"] = {
    widths: ["*", "*"],
    body: [
      [
        {
          text: `Leerling(e): ${student.lastname} ${student.firstname}`,
          style: `info_left`
        },
        {
          text: `Klas: XXXXX`,
          style: `info_right`
        }
      ],
      [
        {
          text: `Studierichting: ${module.name}`,
          style: `info_left`
        },
        {
          text: ``,
          style: `info_right`
        }
      ],
      [
        {
          text: `Schooljaar: 20XX-20XX`,
          style: `info_left`
        },
        {
          text: `TRIMESTER: X`,
          style: `info_right`
        }
      ]
    ]
  };
  return headerObject;
}

function createModuleArray(module: Module, content: any[]) {
  const body = [];
  for (const domain of module.domains) {
    content.push({ text: domain.name, style: "subheader" });
    for (const goal of domain.goals) {
      body.push([
        { text: goal.name },
        { text: "" },
        { text: "" },
        { text: "" },
        { text: "" },
        { text: "" }
      ]);
    }
  }
  const moduleObject: any = {
    table: {
      widths: ["*", 25, 25, 25, 25, "*"],
      body: body
    }
  };
  content.push(moduleObject);
}

export function createReportPDF(id: number, student: User, module: Module) {
  const content: any[] = [];
  const pdf = { styles: styles, content: content };
  pdf.content.push(createHeaderObject(student, module));
  pdf.content.push(scoreHeader);
  pdf.content.push({
    text: `Module: ${module.name}`,
    style: "header"
  });
  createModuleArray(module, pdf.content);
  return pdf;
}
