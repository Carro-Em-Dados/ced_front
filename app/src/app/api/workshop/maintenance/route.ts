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
const workshopsRef = db.collection("workshops");
const servicesRef = db.collection("services");

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const param = searchParams.get("workshop");

    try {
        let res: any = [];
        let data = (await workshopsRef.doc(param!).get()).data();
        let services = data!.services;
        for (const s of services) {
            let serviceData = (await servicesRef.doc(s.trim()).get()).data()
            res = [...res, serviceData];
        }
        return NextResponse.json(res, { status: 200 });
    } catch (err) {
        return NextResponse.json({}, { status: 500 });
    }
}

export async function POST(req: NextRequest) {}
