import { Button } from "@nextui-org/react";
import { FaPaperPlane } from "react-icons/fa";
import emailjs from "emailjs-com";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

export default function SendEMail({ workshopName, maintenances }: ButtonProps) {

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
    
                const padding = 5;
                doc.setFillColor("gray");
                doc.rect(imageX - padding, imageY - padding, imageWidth + 2 * padding, imageHeight + 2 * padding, "F");
    
                doc.addImage(logo.src, "PNG", imageX, imageY, imageWidth, imageHeight);
            },
        });
    
        return doc.output("blob");
    };

    const sendEmailWithPDF = async () => {
        try {
            // Step 1: Generate the PDF Blob using exportToPDF
            const pdfBlob = await exportToPDF();

            // Step 2: Convert the Blob to a Base64 string (required for EmailJS)
            const reader = new FileReader();
            reader.readAsDataURL(pdfBlob);
            reader.onloadend = async () => {
                const base64PDF = (reader.result as string).split(",")[1]; // Get Base64 content

                // Step 3: Send the email using EmailJS
                const emailParams = {
                    to_email: "recipient@example.com", // Replace with recipient's email
                    pdf_attachment: base64PDF, // Attach the Base64-encoded PDF
                };

                const serviceId = "YOUR_SERVICE_ID"; // Replace with EmailJS service ID
                const templateId = "YOUR_TEMPLATE_ID"; // Replace with EmailJS template ID
                const userId = "YOUR_USER_ID"; // Replace with your EmailJS user ID

                await emailjs.send(serviceId, templateId, emailParams, userId);
                alert("Email sent successfully!");
            };
        } catch (error) {
            console.error("Error sending email:", error);
            alert("Failed to send email.");
        }
    };

    return (
        <Button
            onClick={sendEmailWithPDF}
            className="bg-gradient-to-b from-[#209730] to-[#056011] text-white w-fit flex flex-row"
        >
            <FaPaperPlane size={20} />
            <p>Send</p>
        </Button>
    );
}
