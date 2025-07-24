import { Button } from "@nextui-org/react";
import { FaPaperPlane } from "react-icons/fa";
import { MaintenanceData } from "@/interfaces/maintenanceData";
import { sendEmailWithPDF } from "@/server/send-email";
import { exportToPDF } from "@/functions/exportToPDF";

interface ButtonProps {
  workshopName: string;
  maintenances: MaintenanceData[];
}

export default function SendEMail({ workshopName, maintenances }: ButtonProps) {
  const handleSendEmail = async () => {
    try {
      const pdfBlob = await exportToPDF(workshopName, maintenances);
      const base64 = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onloadend = () => res((reader.result as string).split(",")[1]);
        reader.readAsDataURL(pdfBlob);
      });

      await sendEmailWithPDF(base64);
      console.log("Email enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar email:", error);
    }
  };

  return (
    <Button
      onClick={handleSendEmail}
      className="bg-gradient-to-b from-[#209730] to-[#056011] text-white w-fit flex flex-row"
    >
      <FaPaperPlane size={20} />
      <p>Enviar por email</p>
    </Button>
  );
}
