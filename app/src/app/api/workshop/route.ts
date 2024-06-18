import { NextRequest, NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { WorkshopMin } from "@/interfaces/workshop";

const DECODED_KEY = Buffer.from(process.env.PRIVATE_KEY!, "base64").toString(
    "utf-8"
);

const app =
    getApps().length === 0
        ? initializeApp({
              credential: cert({
                  projectId: process.env.PROJECT_ID,
                  clientEmail: process.env.CLIENT_EMAIL,
                  privateKey: DECODED_KEY.replace(/\\n/g, "\n"),
              }),
              databaseURL: "carro-em-dados.firebaseapp.com",
          })
        : getApps()[0];

const db = getFirestore(app);
const workshopsRef = db.collection("workshops");

export async function GET(req: NextRequest) {
    let res: WorkshopMin[] = [];
    const workshopDocs = await workshopsRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const ws = doc.data() as WorkshopMin
            res = [...res, {
                id: ws.id,
                company_name: ws.company_name,
                fantasy_name: ws.fantasy_name,
                phone: ws.phone,
                email: ws.email,
                notification_thresholds:ws.notification_thresholds
            }];
        })
    }).catch((error) => {
        return NextResponse.json({message: "Error getting workshops", error}, {status: 400})
    })

    return NextResponse.json(res, {status: 200});
}