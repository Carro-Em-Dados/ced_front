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
const collectionRef = db.collection("configs");
export async function GET(req: NextRequest) {
    const data = (await collectionRef.doc("data").get()).data()
    // console.log(data)
    return NextResponse.json({data}, {status: 200});
}
// export async function POST(req: NextRequest) {}
