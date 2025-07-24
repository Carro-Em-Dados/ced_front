import * as admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";

const serviceAccount = JSON.parse(
  process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT!
) as ServiceAccount;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const items: string[] = [
  "Leva e Traz",
  "Lavagem",
  "Polimento",
  "Cristalização",
  "Higienização interna",
  "Oxi sanitização do sistema AC",
  "Polimento de vidros",
  "Polimento de faróis",
  "Reforma de rodas",
  "Hidratação de couro",
  "Hidratação de partes plásticas",
  "Limpeza do motor",
  "Substituição de Lâmpadas",
  "Outros",
];

const WORKSHOP_ID = "yyW4Rufm5ySJONxXyIZj";

async function seed() {
  const batch = db.batch();
  const colRef = db.collection("services");

  items.forEach((item) => {
    const docRef = colRef.doc();
    console.log(`Criando documento: ${docRef.id}`);
    batch.set(docRef, {
      description: item,
      price: 0,
      service: item,
      workshop: WORKSHOP_ID,
    });
  });

  await batch.commit();
  console.log(`Seed concluído: ${items.length} documentos criados.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Erro no seed:", err);
    process.exit(1);
  });
