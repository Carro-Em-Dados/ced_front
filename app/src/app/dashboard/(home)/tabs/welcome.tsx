"use client";
import React, { useContext, useEffect, useState } from "react";
import styles from "./welcome.module.scss";
import Image from "next/image";
import DropdownComponent from "@/custom/dropdown/Dropdown";
import Dashboard from "../components/dashboard/dashboard";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { Workshop } from "@/interfaces/workshop.type";
import { AuthContext } from "@/contexts/auth.context";
import { toast, Zoom } from "react-toastify";

export default function Welcome() {
	const [workshops, setWorkshops] = useState<Workshop[]>([]);
	const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null);
	const [workshopName, setWorkshopName] = useState("");
	const { currentUser, currentWorkshop, db } = useContext(AuthContext);

	useEffect(() => {
		getWorkshops();
	}, [currentUser, currentWorkshop]);

	const getWorkshops = async () => {
		if (!currentUser || (!currentWorkshop && currentUser.role !== "master"))
			return;
		try {
			if (currentUser.role === "master") {
				const querySnapshot = await getDocs(collection(db, "workshops"));
				if (!querySnapshot.empty) {
					const data = querySnapshot.docs.map((doc) => ({
						...(doc.data() as Workshop),
						id: doc.id,
					}));
					setWorkshops(data);
				}
			} else {
				const docRef = doc(db, "workshops", currentWorkshop!.id);
				const docSnap = await getDoc(docRef);
				if (docSnap.exists()) {
					const data = { ...(docSnap.data() as Workshop), id: docSnap.id };
					setWorkshops([data]);
				}
			}
		} catch (error) {
			toast.error("Algo deu errado!", {
				position: "bottom-right",
				autoClose: 5000,
				hideProgressBar: true,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: "dark",
				transition: Zoom,
			});
		}
	};

	return (
		<div className={styles.pageWrap}>
			<div className={styles.textContainer}>
				<div className={styles.titleContainer}>
					<div className={styles.rectangleContainer}>
						<Image
							src="/rectangle.png"
							alt="Retângulo título"
							fill
							style={{ objectFit: "cover" }}
						/>
					</div>
					{currentUser?.name ? (
						<h1 className={styles.mainTitle}>{`Olá, ${currentUser?.name}!`}</h1>
					) : (
						<h1 className={styles.mainTitle}>Olá!</h1>
					)}
				</div>
				<p className={styles.subtext}>
					Gostaria de conferir o status da sua oficina?
				</p>
				<p className={styles.subtext}>Selecione alguma opção abaixo:</p>
				<div className="flex flex-col gap-2 w-[26em] my-[2em]">
					<DropdownComponent
						options={
							currentUser?.role === "master"
								? [
										{ label: "Geral", key: "all" },
										...(workshops
											?.filter(
												(workshop) => workshop.fantasy_name && workshop.id
											)
											.map((workshop) => ({
												label: workshop.fantasy_name!,
												key: workshop.id!,
											})) || []),
								  ]
								: ([
										currentWorkshop?.fantasy_name && currentWorkshop?.id
											? {
													label: currentWorkshop.fantasy_name,
													key: currentWorkshop.id,
											  }
											: null,
								  ].filter((option) => option !== null) as {
										label: string;
										key: string;
								  }[])
						}
						placeholder="Selecione sua oficina"
						value={selectedWorkshop}
						onChange={(key) => {
							setSelectedWorkshop(key.toString());
							setWorkshopName(
								workshops.find((w) => w.id === key)?.fantasy_name!
							);
						}}
					/>
				</div>
			</div>
			{selectedWorkshop ? (
				<Dashboard
					selectedWorkshop={selectedWorkshop}
					workshopName={workshopName}
				/>
			) : (
				<WelcomeImage />
			)}
		</div>
	);
}

const WelcomeImage = () => {
	return (
		<div className={styles.imageContainer}>
			<Image
				src="/car_home1.png"
				alt="Carro na Home Principal"
				fill
				style={{ objectFit: "cover", objectPosition: "right 20% bottom 0" }}
			/>
		</div>
	);
};
