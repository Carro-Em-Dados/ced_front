"use client";
import React, { useContext, useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TbFileTypePdf } from "react-icons/tb";
import logo from "../../public/logo1.png";

interface ButtonProps {
  workshopName: string;
  maintenances: MaintenanceData[];
}

interface MaintenanceData {
    client: string;
    clientId: string;
    vehicle: string;
    vehicleId: string;
    vehicleBrand: string;
    vehicleModel: string;
    vehicleYear: string;
    maintenance: string;
    km_current: number;
    km_threshold: number;
    date_threshold: string;
    status: string;
    obd2Distance: number;
    gpsDistance: number;
    id?: string;
}
  
export default function ButtonExport({ workshopName, maintenances }: ButtonProps) {

    const exportToPDF = async () => {
      const doc = new jsPDF();
  
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, "F");
  
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
  
      const columns = ["Cliente", "Veículo", "Manutenção", "Km atual", "Km limite", "Data limite", "Status"];
  
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
              fillColor: [241, 241, 241],
              textColor: 0,
              fontSize: 10,
              lineColor: 0,
              lineWidth: 0.1,
          },
          alternateRowStyles: {
              fillColor: 221,
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
  
              const padding = 5;
              doc.setFillColor("gray");
              doc.rect(imageX - padding, imageY - padding, imageWidth + 2 * padding, imageHeight + 2 * padding, "F");
  
              doc.addImage(logo.src, "PNG", imageX, imageY, imageWidth, imageHeight);
          },
      });
  
      return doc.save("relatorio_manutencoes.pdf");
  };

      return (
        <Button onClick={exportToPDF} className="bg-gradient-to-b from-[#209730] to-[#056011] text-white w-fit flex flex-row">
            <TbFileTypePdf size={25} />
            <p>Exportar</p>
        </Button>
        );
}