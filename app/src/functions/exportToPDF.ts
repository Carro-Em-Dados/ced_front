import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo_black_n_white from "../../public/logo_black_n_white.png";
import { MaintenanceData } from "@/interfaces/maintenanceData";

async function loadImage(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Falha ao carregar logo: ${res.status}`);
  }
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error("Falha ao converter logo para Base64."));
    };
    reader.readAsDataURL(blob);
  });
}

export async function exportToPDF(
  workshopName: string,
  maintenances: MaintenanceData[]
) {
  const doc = new jsPDF(
    { compress: true } // remove it when we pay for emailjs subscription
  ); // Gotta pay emailjs subscription to send pdfs with more than 50kb

  doc.setFillColor(255, 255, 255);
  doc.rect(
    0,
    0,
    doc.internal.pageSize.width,
    doc.internal.pageSize.height,
    "F"
  );

  doc.setTextColor(0, 0, 0);
  const titleText = "Relatório de Manutenções da Oficina " + workshopName;
  const descriptionText = `Relatório gerado em ${new Date().toLocaleString("pt-BR")}`;
  const pageWidth = doc.internal.pageSize.width;
  const wrappedTitleText = doc.splitTextToSize(titleText, pageWidth - 20);
  const titleX = (pageWidth - doc.getTextWidth(wrappedTitleText[0])) / 2;
  doc.setFontSize(16);

  let currentY = 15;
  wrappedTitleText.forEach((line: string) => {
    doc.text(line, titleX, currentY);
    currentY += 8;
  });

  doc.setFontSize(12);
  const descriptionX = (pageWidth - doc.getTextWidth(descriptionText)) / 2; // Center the description
  doc.text(descriptionText, descriptionX, currentY);
  const startY = currentY + 10;

  const tableData = maintenances.map((row) => [
    row.client,
    row.vehicle,
    row.maintenance,
    row.km_current,
    row.km_threshold,
    row.date_threshold,
    row.status,
  ]);

  const columns = [
    "Cliente",
    "Veículo",
    "Manutenção",
    "Km atual",
    "Km limite",
    "Data limite",
    "Status",
  ];

  autoTable(doc, {
    head: [columns],
    body: tableData,
    startY: startY,
    headStyles: {
      fillColor: 255,
      textColor: 0,
      fontSize: 12,
      lineColor: 0,
      lineWidth: 0.1,
      valign: "middle",
    },
    bodyStyles: {
      fillColor: [191, 191, 191],
      textColor: 0,
      fontSize: 10,
      lineColor: 0,
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: 131,
      lineColor: 0,
      lineWidth: 0.1,
    },
    styles: { fontSize: 10 },
    didDrawPage: (data) => {
      const pageHeight = doc.internal.pageSize.height;
      const bottomMargin = 30;
      const imageWidth = 50;
      const imageHeight = 20;
      const imageX = (pageWidth - imageWidth) / 2;
      const imageY = pageHeight - imageHeight - 10;
    },
  });

  return doc.output("blob");
}
