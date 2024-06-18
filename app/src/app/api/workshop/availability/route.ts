import { NextRequest, NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { Timestamp, getFirestore } from "firebase-admin/firestore";
import { Workshop } from "@/interfaces/workshop";

const DECODED_KEY = Buffer.from(process.env.PRIVATE_KEY!, "base64").toString(
    "utf-8"
);
const app =
    getApps().length === 0
        ? initializeApp({
              credential: cert({
                  projectId: process.env.PROJECT_ID,
                  clientEmail: process.env.CLIENT_EMAIL,
                  privateKey: DECODED_KEY.replace(/\\n/g, `\n`),
              }),
              databaseURL: "carro-em-dados.firebaseapp.com",
          })
        : getApps()[0];
const db = getFirestore(app);
const collectionRef = db.collection("workshops");
const maintenancesRef = db.collection("maintenances");

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const param = searchParams.get("workshop");
    try {
        const doc = (await collectionRef.doc(param!).get()).data() as Workshop
        if (doc.maintenances.length == 0) {
            return NextResponse.json([], {status: 200})
        }
        let scheduled_times: Timestamp[] = [];
        for(const mt of doc.maintenances) {
            let temp = (await maintenancesRef.doc(mt).get()).data() as Maintenance;
            console.log(temp)
            scheduled_times = [...scheduled_times, temp.date]
        }
        return NextResponse.json(scheduled_times, {status: 200})
    }   catch (err) {
        return NextResponse.json({err}, {status: 400})
    }
}

// export async function POST(req: NextRequest) {}
