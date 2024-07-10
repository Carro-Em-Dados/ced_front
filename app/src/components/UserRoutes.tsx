"use client";

import { AuthContext } from "@/contexts/auth.context";
import { useRouter } from "next/navigation";
import { ReactNode, useContext, useEffect } from "react";

interface Props {
	children?: ReactNode | JSX.Element | JSX.Element[] | string;
}

export default function UserRoutes({ children }: Props) {
	const router = useRouter();
	const { currentUser, loading } = useContext(AuthContext);

	useEffect(() => {
		if (!loading && !currentUser) router.push("/");
	}, [currentUser, router]);

	return children;
}
