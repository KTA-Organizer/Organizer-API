import PDFDocument from "pdfkit";
import fs from "fs";
import { Report } from "../models/Report";

export function createReportPDF(id: number, text?: string) {
  const doc = new PDFDocument();

  createFrontPage(doc, id);

  doc.end();
}

function createFrontPage(doc: PDFKit.PDFDocument, id: number) {
  doc.pipe(fs.createWriteStream(`pdfs/test-${id}.pdf`));

  doc.text("Rapport", 200, 50, {
    width: 200,
    align: "center"
  });
  doc.text("Firstname Lastname", 200, 65, {
    width: 200,
    align: "center"
  });
  doc.text("Klas nummer", 200, 80, {
    width: 200,
    align: "center"
  });
  doc.text("Schooljaar:20XX-20XX", 200, 95, {
    width: 200,
    align: "center"
  });

  doc.rect(200, 45, 200, 65).stroke();

  doc.image("images/Logos_CLW_KTA_ZWAAN.png", 150, 300, {
    width: 300
  });

  doc.text("KTA- Centrum voor Leren en Werken", 200, 675, {
    width: 200,
    align: "center"
  });
  doc.text("Fonteinstraat 30", 200, 690, {
    width: 200,
    align: "center"
  });
  doc.text("8020 Oostkamp", 200, 705, {
    width: 200,
    align: "center"
  });
}
