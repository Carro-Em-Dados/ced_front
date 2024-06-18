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
const calcsRef = db.collection("calcs");

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const param = searchParams.get("car_id");
    let res: Calc;
    await calcsRef
        .where("car_id", "==", param)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                res = doc.data() as Calc;
            });
        })
        .catch((error) => {
            return NextResponse.json(
                { message: "Error getting calcs" },
                { status: 404 }
            );
        });

    return NextResponse.json(res!, { status: 200 });
}

export async function POST(req: NextRequest) {
    const data: Calc = await req.json();
    const newDoc = calcsRef.doc();
    let docExists = false;
    let calcDoc;

    await calcsRef
        .where("car_id", "==", data.car_id)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                calcDoc = doc;
                docExists = true;
            });
        });

    if (docExists) {
        await calcsRef.doc(
            (
                calcDoc! as FirebaseFirestore.QueryDocumentSnapshot<
                    FirebaseFirestore.DocumentData,
                    FirebaseFirestore.DocumentData
                >
            ).id
        ).update({
            ...data,
        })
        .catch((error) => {
            console.log("Error updating reading: ", error);
            NextResponse.json({}, { status: 409 });
        });
        return NextResponse.json(
            { message: "Calc updated" },
            { status: 201 }
        );
    } else {
        await newDoc
            .set({
                car_id: data.car_id,
                avg_consumption: data.avg_consumption,
                autonomy: data.autonomy,
            })
            .catch((error) => {
                NextResponse.json(
                    { messasge: "Error creating calc", error },
                    { status: 400 }
                );
            });

        return NextResponse.json({ message: "Calc created" }, { status: 201 });
    }
}
