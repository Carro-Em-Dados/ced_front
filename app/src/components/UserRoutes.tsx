"use client";

import { AuthContext } from "@/contexts/auth.context";
import { useRouter } from "next/navigation";
import { ReactNode, useContext, useEffect } from "react";

interface Props {
  children?: ReactNode | JSX.Element | JSX.Element[] | string;
}

export default function UserRoutes({ children }: Props) {
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser === undefined) router.push("/");
  }, [currentUser, router]);

  return children;
}
