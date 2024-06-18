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
const readingsRef = db.collection("readings");

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const param = searchParams.get("car_id");
    let res: Reading | undefined;
    await readingsRef
        .where("car_id", "==", param)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                res = doc.data() as Reading;
            });
        })
        .catch((error) => {
            console.log("Error getting reading: ", error);
            return NextResponse.json({}, { status: 404 });
        });
    if (res) {
        return NextResponse.json(res, { status: 200 });
    } else {
        return NextResponse.json({}, { status: 404 });
    }
}

export async function POST(req: NextRequest) {
    const data: Reading = await req.json();
    let readingExists = false;
    let readingDoc;

    await readingsRef
        .where("car_id", "==", data.car_id)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                readingDoc = doc;
                readingExists = true;
            });
        });

    //update if already exists reading for vehicle
    if (readingExists) {
        await readingsRef
            .doc(
                (
                    readingDoc! as FirebaseFirestore.QueryDocumentSnapshot<
                        FirebaseFirestore.DocumentData,
                        FirebaseFirestore.DocumentData
                    >
                ).id
            )
            .update({
                ...data,
            })
            .catch((error) => {
                console.log("Error updating reading: ", error);
                NextResponse.json({}, { status: 409 });
            });
        return NextResponse.json(
            { message: "Reading updated" },
            { status: 201 }
        );
    }

    //create new if no reading exists for vehicle
    else {
        const newDoc = readingsRef.doc();
        try {
            await newDoc
                .set({
                    id: newDoc.id,
                    createdAt: new Date().getTime(),
                    uid: data.uid,
                    car_id: data.car_id,
                    vin: data.vin,
                    rpm: data.rpm,
                    engine_temp: data.engine_temp,
                    battery_tension: data.battery_tension,
                    oil_pressure: data.oil_pressure,
                    speed: data.speed,
                    tank_level: data.tank_level,
                    obd2_distance: data.obd2_distance,
                    dtc_readings: data.dtc_readings,
                    gps_distance: data.gps_distance,
                })
                .catch((error) => {
                    NextResponse.json(
                        { messasge: "Error creating reading" },
                        { status: 400 }
                    );
                });
            return NextResponse.json(
                { message: "Reading created" },
                { status: 201 }
            );
        } catch (err) {
            throw err;
        }
    }
}
