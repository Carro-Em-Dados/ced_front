"use server";

import admin from "firebase-admin";

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
