import { NextRequest, NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
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
const vehiclesRef = db.collection("vehicles");
const alarmsRef = db.collection("alarms");

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const param = searchParams.get("car_id");
    try {
        let data = (await vehiclesRef.doc(param!).get()).data();
        const alarms = (await alarmsRef.doc(data!.alarms).get()).data();
        return NextResponse.json(alarms, { status: 200 });
    } catch (err) {
        return NextResponse.json(
            { message: "Error getting alarms" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const data = (await req.json()) as Alarm;
    const newDoc = alarmsRef.doc();
    await newDoc
        .set({
            id: newDoc.id,
            uid: data.uid,
            car_id: data.car_id,
            workshop: data.workshop,
            alarms: data.alarms,
            obd2_alarms: data.obd2_alarms,
        } as Alarm)
        .catch((error) => {
            return NextResponse.json({ message: error }, { status: 500 });
        });

    return NextResponse.json({ message: "success" }, { status: 200 });
}
