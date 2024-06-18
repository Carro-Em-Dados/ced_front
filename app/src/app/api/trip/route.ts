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
                  privateKey: DECODED_KEY.replace(/\\n/g, "\n"),
              }),
              databaseURL: "carro-em-dados.firebaseapp.com",
          })
        : getApps()[0];

const db = getFirestore(app);
const tripsRef = db.collection("trips");

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const param = searchParams.get("uid");
    let res: Trip[] = [];
    await tripsRef
        .where("uid", "==", param)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                res = [...res, doc.data() as Trip];
            });
        })
        .catch((error) => {
            return NextResponse.json(
                { message: "Error getting trips" },
                { status: 404 }
            );
        });

    return NextResponse.json(res, { status: 200 });
}

export async function POST(req: NextRequest) {
    const data: Trip = await req.json();
    const newDoc = tripsRef.doc();

    await newDoc
        .set({
            id: newDoc.id,
            uid: data.uid,
            car_id: data.car_id,
            createdAt: data.createdAt,
            finishedAt: data.finishedAt
        })
        .catch((error) => {
            NextResponse.json(
                { messasge: "Error creating reading", error },
                { status: 400 }
            );
        });
    return NextResponse.json({ message: "Reading created" }, { status: 201 });
}
