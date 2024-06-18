import { ReactNode, createContext } from 'react';
import firebase from "firebase/compat/app";
// Required for side-effects
import "firebase/firestore";

interface FirebaseContextData {
    firebaseConfig: any,
}

interface FirebaseProviderProps {
    children: ReactNode
}

export const FirebaseContext = createContext<FirebaseContextData>({} as FirebaseContextData);

export function FirebaseProvider({ children }: FirebaseProviderProps) {
    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    return (
        <FirebaseContext.Provider
            value={{ firebaseConfig } as FirebaseContextData}>
            {children}
        </FirebaseContext.Provider>
    );
}

export default FirebaseProvider;