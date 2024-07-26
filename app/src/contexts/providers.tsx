"use client";

import { ReactNode } from "react";
import FirebaseProvider from "./firebase.context";
import AuthProvider from "./auth.context";
import { NextUIProvider } from "@nextui-org/react";
import ToastProvider from "@/providers/ToastProvider";

interface Props {
	children: ReactNode;
}

export function Providers({ children }: Props) {
	return (
		<FirebaseProvider>
			<AuthProvider>
				<NextUIProvider>
					<ToastProvider>{children}</ToastProvider>
				</NextUIProvider>
			</AuthProvider>
		</FirebaseProvider>
	);
}
