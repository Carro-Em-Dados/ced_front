"use client";
import React, { useState, useEffect, useContext } from "react";
import styles from "./styles.module.scss";
import Navbar from "@/components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import Image from "next/image";
import { Input } from "@nextui-org/react";
import { getDoc, doc } from "firebase/firestore";
import { User } from "@/interfaces/user.type";
import { AuthContext } from "@/contexts/auth.context";
import { useRouter, useSearchParams } from "next/navigation";

const Profile = () => {
	const { db, currentUser: myUser } = useContext(AuthContext);
	const searchParams = useSearchParams();
	const userId = searchParams.get("user");

	const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);

	useEffect(() => {
		const fetchUser = async (id: string) => {
			const docRef = doc(db, "users", id);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				setCurrentUser(docSnap.data() as User);
			}
		};

		if (userId) {
			fetchUser(userId as string);
		} else {
			const user = myUser;
			if (user) {
				fetchUser(user.id);
			}
		}
	}, [userId]);

	function AdminProfile() {
		return (
			<>
				<p className={styles.subtext}>Minhas informações - Admin</p>
				<Input
					className={styles.input}
					isReadOnly
					label="Nome"
					variant="bordered"
					value={currentUser?.name}
				/>
				<Input
					className={styles.input}
					isReadOnly
					type="email"
					label="Email"
					variant="bordered"
					value={currentUser?.email}
				/>
			</>
		);
	}

	function UserProfile() {
		return (
			<>
				<p className={styles.subtext}>Minhas informações - Usuário</p>
				<div className={styles.row}>
					<Input
						className={styles.input}
						isReadOnly
						type="text"
						label="Nome"
						variant="bordered"
						value={currentUser?.name}
					/>
					<span className={styles.horizontalSpace} />
					<Input
						className={styles.input}
						isReadOnly
						type="email"
						label="Email"
						variant="bordered"
						value={currentUser?.email}
					/>
				</div>
			</>
		);
	}

	return (
		<div className={styles.page}>
			<Navbar />
			<div className={styles.pageWrap}>
				<div className={styles.header}>
					<div className={styles.titleContainer}>
						<div className={styles.rectangleContainer}>
							<Image
								src="/rectangle.png"
								alt="Retângulo título"
								fill
								style={{ objectFit: "cover" }}
							/>
						</div>
						<h1 className={styles.mainTitle}>Perfil</h1>
					</div>
				</div>
				<div className={styles.content}>
					{currentUser?.role == "admin" ? (
						<AdminProfile />
					) : currentUser?.role == "user" ? (
						<UserProfile />
					) : (
						<>No user role found</>
					)}
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default Profile;
