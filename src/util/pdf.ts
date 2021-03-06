import { Report } from "../models/Report";
import * as Canvas from "canvas";
import { Module } from "../models/Module";
import { User } from "../models/User";
import { promise as DataURI } from "datauri";
import moment from "moment";
import { EvaluationSheet } from "../models/EvaluationSheet";

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

function getPeriodString(evaluationSheet: EvaluationSheet) {
  return evaluationSheet.periodname;
}

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

function createHeaderObject(report: Report, student: User, module: Module) {
  const headerObject: any = { layout: "noBorders" };
  headerObject["table"] = {
    widths: ["*", "*"],
    body: [
      [
        {
          text: `Leerling(e): ${student.lastname} ${student.firstname}`,
          style: `info_left`
        },
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
          text: getPeriodString(report.evaluationSheet),
          style: `info_left`
        },
      ]
    ]
  };
  return headerObject;
}

async function getDataURL(image: string) {
  const URI = await DataURI(image);
  return URI;
}

async function createFrontPage(report: Report, student: User) {
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
                text: getPeriodString(report.evaluationSheet),
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
        width: "auto",
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
  return { reportHeader, image, address };
}

function getCommentForGoal(goalComments: any, goalid: number) {
  const comment = goalComments.find((obj: any) => {
    return +obj.goalid === +goalid;
  });
  if (!comment) return "";
  return comment.comment;
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

function getGeneralComment(report: Report) {
  const table = {
    table: {
      widths: ["*"],
      headerRows: 1,
      body: [
        [{ text: "Algemene commentaar", style: "subheader" }],
        [
          {
            text: "Commentaar van toepassing op deze module",
            style: { bold: true }
          }
        ],
        [{ text: report.generalComment }]
      ]
    },
    layout: "lightHorizontalLines",
    margin: [0, 0, 0, 10]
  };
  return table;
}

function createDocumentInfo(report: Report) {
  const title = [
    "Rapport",
    report.evaluationSheet.student.firstname,
    report.evaluationSheet.student.lastname,
    moment(report.creation).format("DD-MM-YYYY")
  ].join("_");
  const author = report.evaluationSheet.teacher.firstname + " " + report.evaluationSheet.teacher.lastname;
  return { title, author };
}

export async function createReportPDF(report: Report) {
  const student = report.evaluationSheet.student;
  const module = report.evaluationSheet.module;
  const content: any[] = [];
  const pdf = { info: createDocumentInfo(report), styles, content };
  const frontPageObject = await createFrontPage(report, student);
  pdf.content.push(frontPageObject.reportHeader);
  pdf.content.push(frontPageObject.image);
  pdf.content.push(frontPageObject.address);
  pdf.content.push(createHeaderObject(report, student, module));
  pdf.content.push(scoreHeader);
  pdf.content.push({
    text: `Module: ${module.name}`,
    style: "header"
  });
  pdf.content.push(getGeneralComment(report));
  createModuleArray(report, module, pdf.content);
  return pdf;
}
