"use client";
import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";
import {
	createUserWithEmailAndPassword,
	getAuth,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
} from "firebase/auth";
import { FirebaseContext } from "./firebase.context";
import {
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	query,
	where,
} from "firebase/firestore";
import { User } from "../interfaces/user.type";
import { getApps, initializeApp } from "firebase/app";

interface AuthContextData {
	login: (email: string, password: string) => Promise<any>;
	logout: () => Promise<any>;
	signUp: (email: string, password: string) => Promise<any>;
	currentUser: User | undefined;
	db: any;
}

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthContext = createContext<AuthContextData>(
	{} as AuthContextData
);

export function AuthProvider({ children }: AuthProviderProps) {
	const firebaseConfig = {
		apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
		authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
		projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
		storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
		messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
		appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
		measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
	};

	let app =
		getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
	const db = getFirestore(app);

	const auth = getAuth(app);
	const [currentUser, setCurrentUser] = useState<User>({
		email: "teste@teste",
		uid: "123",
		role: "master",
		name: "teste",
	});

	async function logout() {
		/* await signOut(auth)
			.then(() => {
				setCurrentUser(undefined);
			})
			.catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				throw `${errorCode}: ${errorMessage}`;
			}); */
	}

	async function signUp(email: string, password: string) {
		/* await createUserWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				setCurrentUser({
					email: userCredential.user.email!,
					name: "Temp",
					uid: userCredential.user.uid,
					role: "",
				});
			})
			.catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				console.log(errorCode, errorMessage);
			}); */
	}

	async function login(email: string, password: string) {
		/* let user: User = {
			email: "",
			uid: "",
			role: "",
			name: "",
		};

		await signInWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				user = {
					email: userCredential.user.email!,
					uid: userCredential.user.uid,
					role: "",
					name: "",
				};
			})
			.catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				console.log(errorCode, errorMessage);
			});

		const docRef = doc(db, "users", user.uid);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			setCurrentUser(docSnap.data() as User);
			localStorage.setItem("user", JSON.stringify(docSnap.data()));
		} */
	}

	return (
		<AuthContext.Provider value={{ login, logout, signUp, currentUser, db }}>
			{children}
		</AuthContext.Provider>
	);
}

export default AuthProvider;
