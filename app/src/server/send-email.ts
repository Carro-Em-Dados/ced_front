"use server";

import Relatorio from "@/email/relatorio-email";
import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY!);

export async function sendEmailWithPDF(base64PDF: string, emailTo: string) {
  return resend.emails.send({
    from: process.env.NEXT_PUBLIC_EMAIL_FROM!,
    subject: "[CARRO EM DADOS] Relatório de Manutenções",
    to: emailTo,
    react: await Relatorio(),
    attachments: [
      {
        filename: "relatorio.pdf",
        content: base64PDF,
        contentType: "application/pdf",
      },
    ],
  });
}
