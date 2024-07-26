"use client";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, Zoom } from "react-toastify";

interface ToastProviderProps {
	children: React.ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
	return (
		<>
			<ToastContainer
				position="bottom-right"
				autoClose={5000}
				hideProgressBar
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss={false}
				draggable
				pauseOnHover={false}
				theme="dark"
				style={{
					display: "flex",
					flexDirection: "column",
				}}
			/>
			{children}
		</>
	);
}
