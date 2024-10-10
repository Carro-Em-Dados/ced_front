"use server";

import admin from "firebase-admin";
import { Contract } from "@/interfaces/contract.type";
import { Workshop } from "@/interfaces/workshop.type";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT as string);

  if (!serviceAccount) {
    throw new Error("Missing service account credentials");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function deleteUser(uid: string) {
  try {
    await admin.auth().deleteUser(uid);
  } catch (error: any) {
    console.error(`Delete User Error (${error.code}): ${error.message}`);
    return false;
  }
}

export async function getCurrentTimestamp() {
  return admin.firestore.Timestamp.now().toMillis();
}

/**
 * Checks if the workshop is premium (has a customized plan or is in the freemium trial)
 * @param workshop JSON data of the workshop
 * @type Workshop & { contract: Contract | null | undefined }
 */
export async function isPremium(workshop: string) {
  const workshopData = JSON.parse(workshop) as Workshop & { contract: Contract | null | undefined };
  if (!workshopData?.contract) return false;
  if (workshopData.contract.id !== "basic") return true;
  const currentTimestamp = admin.firestore.Timestamp.now().toMillis();
  return (workshopData?.createdAt.seconds * 100 || 0) + workshopData.contract.freemiumPeriod * 24 * 60 * 60 * 1000 > currentTimestamp;
}
