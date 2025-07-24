import { Button } from "@nextui-org/react";
import { FaPaperPlane } from "react-icons/fa";
import { MaintenanceData } from "@/interfaces/maintenanceData";
import { sendEmailWithPDF } from "@/server/send-email";
import { exportToPDF } from "@/functions/exportToPDF";
import { useContext } from "react";
import { AuthContext } from "@/contexts/auth.context";
import { collection, query, where, getDocs, Firestore } from "firebase/firestore";

interface ButtonProps {
  workshopName: string;
  workshopId: string;
  maintenances: MaintenanceData[];
}

async function getWorkshopOwnerEmail(workshopId: string, db: Firestore): Promise<string> {
  const queryParams = where("workshops", "==", workshopId);
  const fullQuery = query(collection(db, "users"), queryParams);
  const snapshot = await getDocs(fullQuery);
  if (snapshot.empty) {
    throw new Error("No workshop owner found");
  }
  const ownerEmail = snapshot.docs[0].data().email;
  return ownerEmail;
}


export default function SendEMail({ workshopName, workshopId, maintenances }: ButtonProps) {
  const { db } = useContext(AuthContext);
  
  const handleSendEmail = async () => {
    try {
      const pdfBlob = await exportToPDF(workshopName, maintenances);
      const base64 = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onloadend = () => res((reader.result as string).split(",")[1]);
        reader.readAsDataURL(pdfBlob);
      });

      const ownerEmail = await getWorkshopOwnerEmail(workshopId, db);

      await sendEmailWithPDF(base64, ownerEmail || "kpinheiro@carroemdados.com.br");
      console.log("Email enviado com sucesso!", ownerEmail);
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
