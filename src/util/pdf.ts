import { Report } from "../models/Report";
import * as Canvas from "canvas";
import { Module } from "../models/Module";
import { User } from "../models/User";
import { promise as DataURI } from "datauri";
import PDF from "./Classes/PDF";
import Table from "./Classes/Table";
import Row from "./Classes/Row";
import Cell from "./Classes/Cell";

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
  const headerObject: any = { layout: "noBorders" };
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

async function getDataURL(image: string) {
  const URI = await DataURI(image);
  return URI;
}

async function createFrontPage(student: User) {
  const reportHeader = {
    columns: [
      {
        width: "*",
        text: ""
      },
      {
        width: "auto",
        table: {
          body: [
            [
              {
                text: "Rapport",
                style: {
                  bold: true
                },
                alignment: "center"
              }
            ],
            [
              {
                text: `${student.lastname} ${student.firstname}`,
                style: {
                  bold: true
                },
                alignment: "center"
              }
            ],
            [
              {
                text: "Klas 7",
                style: {
                  bold: true
                },
                alignment: "center"
              }
            ],
            [
              {
                text: "Schooljaar: 20XX-20XX",
                alignment: "center"
              }
            ]
          ]
        },
        layout: {
          hLineWidth: function(i: any, node: any) {
            return i === 0 || i === node.table.body.length ? 2 : 0;
          },
          vLineWidth: function(i: any, node: any) {
            return i === 0 || i === node.table.widths.length ? 2 : 0;
          }
        }
      },
      {
        width: "*",
        text: ""
      }
    ]
  };
  const image = {
    columns: [
      {
        width: "*",
        text: ""
      },
      {
        image: await getDataURL("images/Logos_CLW_KTA_ZWAAN.png"),
        fit: [200, 200],
        margin: [0, 200, 0, 230]
      },
      {
        width: "*",
        text: ""
      }
    ]
  };
  const address = {
    columns: [
      {
        width: "*",
        text: ""
      },
      {
        width: "auto",
        layout: "noBorders",
        table: {
          body: [
            [
              {
                text: "KTA- Centrum voor Leren en Werken",
                stye: {
                  bold: true
                },
                alignment: "center"
              }
            ],
            [
              {
                text: "Fonteinstraat 30",
                alignment: "center"
              }
            ],
            [
              {
                text: "8020 Oostkamp",
                alignment: "center"
              }
            ]
          ]
        }
      },
      {
        width: "*",
        text: "",
        pageBreak: "after"
      }
    ]
  };
  return [reportHeader, image, address];
}

function getCommentForGoal(goalComments: any, goalid: number) {
  const comment = goalComments.find((obj: any) => obj.goalid === goalid);
  return comment ? comment : "";
}

function getScoreForGoal(
  goalAggregateScores: any,
  goalid: number,
  expected: number
) {
  const score = goalAggregateScores.find((obj: any) => obj.goalid === goalid);
  return !!score && Math.round(score.grade) === expected ? "X" : "";
}

function createModuleArray(report: Report, module: Module, content: any[]) {
  for (const domain of module.domains) {
    content.push({ text: domain.name, style: "subheader" });
    const body = [];
    for (const goal of domain.goals) {
      body.push([
        { text: goal.name },
        { text: getScoreForGoal(report.goalAggregateScores, goal.id, 4) },
        { text: getScoreForGoal(report.goalAggregateScores, goal.id, 3) },
        { text: getScoreForGoal(report.goalAggregateScores, goal.id, 2) },
        { text: getScoreForGoal(report.goalAggregateScores, goal.id, 1) },
        { text: getCommentForGoal(report.goalComments, goal.id) }
      ]);
    }
    const moduleObject: any = {
      table: {
        widths: ["*", 25, 25, 25, 25, "*"],
        body: body
      }
    };
    content.push(moduleObject);
  }
}

export async function createReportPDF(report: Report) {
  const student = report.evaluationSheet.student;
  const module = report.evaluationSheet.module;
  const pdf = new PDF();
  const frontPageArray = await createFrontPage(student);
  frontPageArray.forEach(obj => {
    pdf.addContent(obj);
  });
  pdf.addContent(createHeaderObject(student, module));
  pdf.addContent(scoreHeader);
  pdf.addContent({
    text: `Module: ${module.name}`,
    style: "header"
  });
  // createModuleArray(report, module, pdf.content);
  return pdf;
}
