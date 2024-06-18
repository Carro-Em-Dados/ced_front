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

const auth = getAuth(app);
const db = getFirestore(app);
const usersRef = db.collection("appUsers");
const vehiclesRef = db.collection("vehicles");

export async function POST(req: NextRequest) {
    const data: AppUser = await req.json();
    
    const vehicles: string[] = data.vehicles.map((v: Vehicle) => {
        return v.id;
    });
    let newUserData: any = structuredClone(data);
    newUserData.vehicles = vehicles;
    await usersRef
        .doc(newUserData.uid)
        .update({
            ...newUserData,
        })
        .catch((error) => {
            console.log("Error updating user: ", error);
            NextResponse.json({}, { status: 409 });
        });

    for (const vehicle of data.vehicles) {
        await vehiclesRef.doc(vehicle.id).update(vehicle).catch((error) => {
            console.log("Error updating user vehicle: ", error);
            NextResponse.json({}, { status: 409 });
        })
    }

    return NextResponse.json({}, { status: 201 });
}
