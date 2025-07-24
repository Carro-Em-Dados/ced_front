"use server";

import { exportToPDF } from "@/functions/exportToPDF";
import { MaintenanceData } from "@/interfaces/maintenanceData";
import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY!);

export async function sendEmailWithPDF(base64PDF: string) {
  return resend.emails.send({
    from: process.env.NEXT_PUBLIC_EMAIL_FROM!,
    to: process.env.NEXT_PUBLIC_EMAIL_TO!,
    subject: "[CARRO EM DADOS] Relatório de Manutenções",
    text: "Segue o relatório de manutenções em anexo.",
    attachments: [
      {
        filename: "relatorio.pdf",
        content: base64PDF,
        contentType: "application/pdf",
      },
    ],
  });
}
