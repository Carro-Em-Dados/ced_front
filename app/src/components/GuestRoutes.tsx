"use client";
import { useRouter } from "next/navigation";
import { ReactNode, useContext, useEffect } from "react";
import { AuthContext } from "../contexts/auth.context";

interface Props {
  children?: ReactNode | JSX.Element | JSX.Element[] | string;
}

export default function GuestRoutes({ children }: Props) {
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser !== undefined) router.push("/dashboard");
  }, [currentUser, router]);

  return children;
}
