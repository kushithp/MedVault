import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";

interface ExportData {
  title: string;
  date: string;
  category: string;
  bodyPart: string;
  riskLevel: string;
  simpleSummary: string;
  keyFindings: string[];
  abnormalFindings: string[];
  normalFindings: string[];
  recommendations: string[];
  questionsForDoctor: string[];
  medicalTerms: Record<string, string>;
}

export const exportToPDF = (data: ExportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(37, 99, 235); // Blue-600
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("MedVault AI Scan Report", 20, 25);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth - 20, 25, { align: "right" });

  // Patient / Report Info
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  doc.text(data.title, 20, 55);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Type: ${data.category} | Area: ${data.bodyPart} | Date: ${data.date}`, 20, 62);

  // Risk Level Badge
  const riskColor = data.riskLevel === 'Critical' || data.riskLevel === 'High' ? [225, 29, 72] : [16, 185, 129];
  doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.roundedRect(pageWidth - 60, 50, 40, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`RISK: ${data.riskLevel.toUpperCase()}`, pageWidth - 40, 56.5, { align: "center" });

  // Simple Summary
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", 20, 75);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const summaryLines = doc.splitTextToSize(data.simpleSummary, pageWidth - 40);
  doc.text(summaryLines, 20, 82);

  let currentY = 82 + (summaryLines.length * 5) + 10;

  // Key Findings Table
  (doc as any).autoTable({
    startY: currentY,
    head: [['Clinical Findings', 'Observation']],
    body: [
      ...data.abnormalFindings.map(f => [['Abnormal'], f]),
      ...data.normalFindings.map(f => [['Normal'], f])
    ],
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
    columnStyles: { 0: { fontStyle: 'bold', width: 30 } }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Recommendations and Questions
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Next Steps & Recommendations", 20, currentY);
  currentY += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  data.recommendations.forEach(rec => {
    doc.text(`• ${rec}`, 25, currentY);
    currentY += 5;
  });

  currentY += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Questions for your Physician", 20, currentY);
  currentY += 7;
  doc.setFont("helvetica", "normal");
  data.questionsForDoctor.forEach(q => {
    doc.text(`? ${q}`, 25, currentY);
    currentY += 5;
  });

  // Footer Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const disclaimer = "DISCLAIMER: This document is an AI-generated summary for educational purposes. It is NOT a medical diagnosis. Please consult a board-certified professional.";
  const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 40);
  doc.text(disclaimerLines, 20, 280);

  doc.save(`${data.title.replace(/\s+/g, '_')}_Analysis.pdf`);
};

export const exportToDOCX = async (data: ExportData) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "MedVault AI Clinical Summary",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `${data.title}`,
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Type: ", bold: true }),
            new TextRun(`${data.category} | `),
            new TextRun({ text: "Risk Level: ", bold: true }),
            new TextRun(`${data.riskLevel}`),
          ],
        }),
        new Paragraph({ text: "", spacing: { before: 200 } }),
        new Paragraph({
          text: "Summary",
          heading: HeadingLevel.HEADING_3,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: data.simpleSummary,
              font: "Calibri",
            }),
          ],
        }),
        new Paragraph({ text: "", spacing: { before: 200 } }),
        new Paragraph({
          text: "Key Abnormal Findings",
          heading: HeadingLevel.HEADING_3,
        }),
        ...data.abnormalFindings.map(f => new Paragraph({ text: `• ${f}`, bullet: { level: 0 } })),
        new Paragraph({ text: "", spacing: { before: 200 } }),
        new Paragraph({
          text: "Disclaimer",
          heading: HeadingLevel.HEADING_4,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "This AI-generated analysis is for informational purposes only.",
              italics: true,
            }),
          ],
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${data.title.replace(/\s+/g, '_')}.docx`);
};

export const exportToTXT = (data: ExportData) => {
  const content = `
MEDVAULT AI SCAN ANALYSIS
-------------------------
Report: ${data.title}
Date: ${data.date}
Risk Level: ${data.riskLevel}

SUMMARY:
${data.simpleSummary}

ABNORMAL FINDINGS:
${data.abnormalFindings.map(f => `- ${f}`).join('\n')}

NORMAL FINDINGS:
${data.normalFindings.map(f => `- ${f}`).join('\n')}

RECOMMENDATIONS:
${data.recommendations.map(r => `- ${r}`).join('\n')}

QUESTIONS FOR DOCTOR:
${data.questionsForDoctor.map(q => `- ${q}`).join('\n')}

---
DISCLAIMER: This is an AI summary, not a medical diagnosis.
  `;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `${data.title.replace(/\s+/g, '_')}.txt`);
};
