import { ReactNode, createContext, useEffect, useState } from "react";
import {
	createUserWithEmailAndPassword,
	getAuth,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
	signInWithPopup,
	GoogleAuthProvider,
	FacebookAuthProvider,
	setPersistence,
	browserSessionPersistence,
	Auth,
} from "firebase/auth";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	query,
	setDoc,
	where,
} from "firebase/firestore";
import { User } from "../interfaces/user.type";
import { initializeApp } from "firebase/app";
import { Workshop } from "@/interfaces/workshop.type";
import { Contract } from "@/interfaces/contract.type";

interface AuthContextData {
	login: (email: string, password: string) => Promise<void>;
	loginWithGoogle: () => Promise<void>;
	loginWithFacebook: () => Promise<void>;
	logout: () => Promise<void>;
	signUp: (email: string, name: string, password: string) => Promise<void>;
	currentUser: User | undefined;
	currentWorkshop: (Workshop & { contract?: Contract | null }) | undefined;
	db: any;
	loading: boolean;
	auth: Auth;
}

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthContext = createContext<AuthContextData>(
	{} as AuthContextData
);

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
	const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
	const [currentWorkshop, setCurrentWorkshop] = useState<
		(Workshop & { contract?: Contract | null }) | undefined
	>(undefined);
	const [loading, setLoading] = useState<boolean>(true);

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
			console.error(
				"Erro ao configurar a persistência da autenticação:",
				error.message
			);
		});

		return () => unsubscribe();
	}, [auth, db]);

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

				if (workshopData.contract_id) {
					const contractRef = doc(db, "contracts", workshopData.contract_id);
					const contractSnap = await getDoc(contractRef);
					let contractData;

					if (contractSnap.exists()) {
						contractData = contractSnap.data() as Contract;
					} else {
						const basicContractRef = doc(db, "contracts", "basic");
						const basicContractSnap = await getDoc(basicContractRef);
						contractData = basicContractSnap.data() as Contract;
					}

					console.log(contractData);
					setCurrentWorkshop({
						...workshopData,
						id: workshopSnap.id,
						contract: contractData || null,
					});
				} else {
					const basicContractRef = doc(db, "contracts", "basic");
					const basicContractSnap = await getDoc(basicContractRef);
					const contractData = basicContractSnap.data() as Contract;

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
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);

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
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
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
		}
	};

	const loginWithGoogle = async () => {
		const provider = new GoogleAuthProvider();
		try {
			const result = await signInWithPopup(auth, provider);
			const user = result.user;
			const docRef = doc(db, "users", user.uid);
			const docSnap = await getDoc(docRef);
			if (!docSnap.exists()) {
				await setDoc(docRef, {
					email: user.email!,
					name: user.displayName!,
					id: user.uid,
					role: "user",
				});
			}
			if (docSnap.exists()) {
				setCurrentUser(docSnap.data() as User);
				localStorage.setItem("user", JSON.stringify(docSnap.data()));
			}
		} catch (error: any) {
			console.error(`Google Login Error (${error.code}): ${error.message}`);
		}
	};

	const loginWithFacebook = async () => {
		const provider = new FacebookAuthProvider();
		try {
			const result = await signInWithPopup(auth, provider);
			const user = result.user;
			const docRef = doc(db, "users", user.uid);
			const docSnap = await getDoc(docRef);
			if (!docSnap.exists()) {
				await setDoc(docRef, {
					email: user.email!,
					name: user.displayName!,
					id: user.uid,
					role: "user",
				});
			}
			if (docSnap.exists()) {
				setCurrentUser(docSnap.data() as User);
				localStorage.setItem("user", JSON.stringify(docSnap.data()));
			}
		} catch (error: any) {
			console.error(`Facebook Login Error (${error.code}): ${error.message}`);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				login,
				loginWithGoogle,
				loginWithFacebook,
				logout,
				signUp,
				currentUser,
				currentWorkshop,
				db,
				loading,
				auth,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export default AuthProvider;
