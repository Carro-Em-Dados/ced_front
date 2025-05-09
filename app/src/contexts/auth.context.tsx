import { ReactNode, createContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
  Auth,
} from "firebase/auth";
import { doc, Firestore, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { User } from "../interfaces/user.type";
import { initializeApp } from "firebase/app";
import { Workshop } from "@/interfaces/workshop.type";
import { Contract } from "@/interfaces/contract.type";
import { isPremium as _isPremium } from "@/services/firebase-admin";
import { Role } from "@/types/enums/role.enum";
import { FirebaseStorage, getStorage } from "firebase/storage";

interface AuthContextData {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, name: string, password: string) => Promise<void>;
  currentUser: User | undefined;
  currentWorkshop: (Workshop & { contract?: Contract | null }) | undefined;
  db: Firestore;
  storage: FirebaseStorage;
  loading: boolean;
  auth: Auth;
  isPremium: boolean | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [currentWorkshop, setCurrentWorkshop] = useState<(Workshop & { contract?: Contract | null }) | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPremium, setIsPremium] = useState<null | boolean>(null);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser?.role === Role.MASTER) return setIsPremium(true);
    if (!currentWorkshop) return;
    async function checkPremium(
      workshop:
        | (Workshop & {
            contract?: Contract | null;
          })
        | undefined
    ) {
      setIsPremium(await _isPremium(JSON.stringify(workshop)));
    }
    checkPremium(currentWorkshop);
  }, [currentWorkshop, currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserFromLocalStorage();
      } else {
        setCurrentUser(undefined);
        setCurrentWorkshop(undefined);
        localStorage.removeItem("user");
      }
      setLoading(false);
    });

    setPersistence(auth, browserSessionPersistence).catch((error) => {
      console.error("Erro ao configurar a persistência da autenticação:", error.message);
    });

    refreshUser();

    return () => unsubscribe();
  }, [auth, db, storage]);

  useEffect(() => {
    if (currentUser) {
      fetchCurrentWorkshopAndContract();
    }
  }, [currentUser]);

  const fetchUserFromLocalStorage = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  };

  const fetchCurrentWorkshopAndContract = async () => {
    if (!currentUser || !currentUser.workshops) return;

    try {
      const workshopRef = doc(db, "workshops", currentUser.workshops);
      const workshopSnap = await getDoc(workshopRef);

      if (workshopSnap.exists()) {
        const workshopData = workshopSnap.data() as Workshop;

        if (workshopData.contract) {
          const contractRef = doc(db, "contracts", workshopData.contract as string);
          const contractSnap = await getDoc(contractRef);
          let contractData;

          if (contractSnap.exists()) {
            contractData = {
              ...(contractSnap.data() as Contract),
              id: contractRef.id,
            };
          } else {
            const basicContractRef = doc(db, "contracts", "basic");
            const basicContractSnap = await getDoc(basicContractRef);
            contractData = {
              ...(basicContractSnap.data() as Contract),
              id: basicContractRef.id,
            };
          }

          setCurrentWorkshop({
            ...workshopData,
            id: workshopSnap.id,
            contract: contractData || null,
          });
        } else {
          const basicContractRef = doc(db, "contracts", "basic");
          const basicContractSnap = await getDoc(basicContractRef);
          const contractData = {
            ...(basicContractSnap.data() as Contract),
            id: basicContractRef.id,
          };

          setCurrentWorkshop({
            ...workshopData,
            id: workshopSnap.id,
            contract: contractData || null,
          });
        }
      } else {
        console.warn("Oficina não encontrada para o usuário.");
      }
    } catch (error) {
      console.error("Erro ao buscar oficina e contrato:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(undefined);
      setCurrentWorkshop(undefined);
      localStorage.removeItem("user");
    } catch (error: any) {
      console.error(`Logout Error (${error.code}): ${error.message}`);
    }
  };

  const signUp = async (email: string, name: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (!userCredential.user) {
        throw new Error("Registration failed.");
      }

      const user = {
        email: userCredential.user.email!,
        name: name,
        id: userCredential.user.uid,
        role: "user",
      };

      const docRef = doc(db, "users", user.id);
      await setDoc(docRef, user);

      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error: any) {
      console.error(`SignUp Error (${error.code}): ${error.message}`);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user: User = {
        email: userCredential.user.email!,
        id: userCredential.user.uid,
        role: "",
        name: "",
      };

      const docRef = doc(db, "users", user.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCurrentUser(docSnap.data() as User);
        localStorage.setItem("user", JSON.stringify(docSnap.data()));
      }
    } catch (error: any) {
      console.error(`Login Error (${error.code}): ${error.message}`);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCurrentUser(docSnap.data() as User);
        localStorage.setItem("user", JSON.stringify(docSnap.data()));
      }
    } catch (error: any) {
      console.error(`Update User Error (${error.code}): ${error.message}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        signUp,
        currentUser,
        currentWorkshop,
        db,
        storage,
        loading,
        auth,
        isPremium,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
