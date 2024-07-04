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
import {
	addDoc,
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
import { getApps, initializeApp } from "firebase/app";

interface AuthContextData {
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	signUp: (email: string, name: string, password: string) => Promise<void>;
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
	const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				const docRef = doc(db, "users", user.uid);
				const docSnap = await getDoc(docRef);
				if (docSnap.exists()) {
					setCurrentUser(docSnap.data() as User);
					localStorage.setItem("user", JSON.stringify(docSnap.data()));
				}
			} else {
				setCurrentUser(undefined);
				localStorage.removeItem("user");
			}
			setLoading(false);
		});

		fetchUserFromLocalStorage();

		return () => unsubscribe();
	}, [auth, db]);

	const fetchUserFromLocalStorage = () => {
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			setCurrentUser(JSON.parse(storedUser));
		}
	};

	const logout = async () => {
		try {
			await signOut(auth);
			setCurrentUser(undefined);
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

	return (
		<AuthContext.Provider value={{ login, logout, signUp, currentUser, db }}>
			{children}
		</AuthContext.Provider>
	);
}

export default AuthProvider;
