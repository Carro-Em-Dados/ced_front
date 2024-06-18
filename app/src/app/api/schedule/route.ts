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
const maintenancesRef = db.collection("maintenances");

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const param = searchParams.get("uid");
    let res: Maintenance[] = [];
    await maintenancesRef
        .where("uid", "==", param)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                res = [...res, doc.data() as Maintenance];
            });
        })
        .catch((error) => {
            return NextResponse.json(
                { message: "Error getting maintenances" },
                { status: 404 }
            );
        });

    return NextResponse.json(res, { status: 200 });
}

export async function POST(req: NextRequest) {
    const data: Maintenance = await req.json();
    const newDoc = maintenancesRef.doc();

    await newDoc
        .set({
            id: newDoc.id,
            car_id: data.car_id,
            uid: data.uid,
            workshop: data.workshop,
            service: data.service,
            date: data.date,
            added_service_1: data.added_service_1 ? data.added_service_1 : "",
            added_service_2: data.added_service_2 ? data.added_service_2 : "",
            added_service_3: data.added_service_3 ? data.added_service_3 : "",
        })
        .catch((error) => {
            NextResponse.json(
                { messasge: "Error creating maintenance", error },
                { status: 400 }
            );
        });
    return NextResponse.json(
        { message: "Maintenance created", id: newDoc.id },
        { status: 201 }
    );
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const param: string = searchParams.get("id") as string;
    await maintenancesRef
        .doc(param)
        .delete()
        .catch((error) => {
            NextResponse.json(
                { messasge: "Error deleting maintenance", error },
                { status: 404 }
            );
        });
    return NextResponse.json(
        { message: "Maintenance deleted" },
        { status: 201 }
    );
}
