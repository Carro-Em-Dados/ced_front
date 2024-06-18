import { NextRequest, NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { AppUser } from "@/interfaces/appUser";
import { getAuth } from "firebase-admin/auth";

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
const usersRef = db.collection("appUsers");
const vehiclesRef = db.collection("vehicles");

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const param = searchParams.get("email");
    let res: AppUser | undefined;
    await usersRef
        .where("email", "==", param)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                res = {
                    uid: data.uid,
                    email: data.email,
                    preferred_workshop: data.preferred_workshop,
                    name: data.name,
                    phone: data.phone,
                    createdAt: data.createdAt,
                    type: data.type,
                    vehicles: []                };
            });
        })
        .catch((error) => {
            console.log("Error getting user: ", error);
            return NextResponse.json({}, { status: 404 });
        });
    let v: any[] = [];
    await vehiclesRef
        .where("owner", "==", res?.uid)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const data = doc.data() as Vehicle;
                v = [...v, data];
            });
        })
        .catch((error) => {
            console.log("Error getting vehicles: ", error);
            return NextResponse.json({}, { status: 500 });
        });

    if (res) res.vehicles = v;

    if (res) {
        return NextResponse.json(res, { status: 200 });
    } else {
        return NextResponse.json({}, { status: 404 });
    }
}

export async function POST(req: NextRequest) {
    const data = (await req.json()) as AppUser;

    let userExists = false;
    await usersRef
        .where("email", "==", data.email)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                userExists = true;
            });
        });
    if (userExists) {
        return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    const newDoc = usersRef.doc();
    try {
        await newDoc
            .set({
                uid: newDoc.id,
                email: data.email,
                preferred_workshop: data.preferred_workshop,
                name: data.name,
                phone: data.phone,
                createdAt: new Date().getTime(),
                type: "premium",
                vehicles: []
            })
            .catch((error) => {
                console.log("Error creating user: ", error);
                NextResponse.json({ messasge: "Bad request" }, { status: 400 });
            });
    } catch (err) {
        throw err;
    }
    try {
        let idList = []
        for (const vehicle of data.vehicles as Vehicle[]) {
            const newCarDoc = vehiclesRef.doc();
            idList.push(newCarDoc.id)
            await newCarDoc
                .set({
                    car_model: "",
                    gas_capacity: vehicle.gas_capacity,
                    gps_mac: vehicle.gps_mac,
                    id: newCarDoc.id,
                    initial_km: vehicle.initial_km,
                    license_plate: "",
                    obd2_mac: vehicle.obd2_mac,
                    owner: newDoc.id,
                    vin: vehicle.vin,
                    alarms: ''
                })
                .catch((error) => {
                    console.log("Error creating user vehicle: ", error);
                    NextResponse.json(
                        { messasge: "Bad request" },
                        { status: 400 }
                    );
                });
        }
        newDoc.update({
            vehicles: idList
        })
    } catch (err) {
        throw err;
    }
    return NextResponse.json({ uid: newDoc.id }, { status: 201 });
}
