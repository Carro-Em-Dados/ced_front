"use client";
import React, { useContext, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import Image from "next/image";
import {
	Tabs,
	Tab,
	Card,
	CardBody,
	Button,
	useDisclosure,
} from "@nextui-org/react";
import DriverCard from "./components/Cards/DriverCard";
import {
	Timestamp,
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
} from "firebase/firestore";
import { Workshop } from "../../../interfaces/workshop.type";
import { AuthContext } from "../../../contexts/auth.context";
import { User } from "../../../interfaces/user.type";
import UserModal from "./components/UserModal/UserModal";
import DriverModal from "./components/DriverModal/DriverModal";
import OrganizationModal from "./components/OrganizationModal/OrganizationModal";
import OrganizationCard from "./components/Cards/OrganizationCard";
import UserCard from "./components/Cards/UserCard";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { Driver } from "@/interfaces/driver.type";
import { Vehicle } from "@/interfaces/vehicle.type";

const Register = () => {
	const { db, currentUser } = useContext(AuthContext);
	const [drivers, setDrivers] = useState<Driver[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [workshops, setWorkshops] = useState<Workshop[]>([]);

	const fetchData = async () => {
		const clientsSnapshot = await getDocs(collection(db, "clients"));
		const workshopsSnapshot = await getDocs(collection(db, "workshops"));
		const usersSnapshot = await getDocs(collection(db, "users"));
		const vehiclesSnapshot = await getDocs(collection(db, "vehicles"));

		const clientsData = clientsSnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as Driver[];

		const workshopsData = workshopsSnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as Workshop[];

		const usersData = usersSnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as User[];

		const vehiclesData = vehiclesSnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as Vehicle[];

		setDrivers(clientsData);
		setWorkshops(workshopsData);
		setUsers(usersData);
		setVehicles(vehiclesData);
	};

	useEffect(() => {
		fetchData();
	}, [db]);

	function getVehiclesByClient(id: string) {
		return vehicles.filter((vehicle) => vehicle.owner === id);
	}

	const getDriversByWorkshop = (id: string) => {
		const workshop = workshops.find((workshop) => workshop.id === id);
		if (!workshop) return [];

		const clientIds = workshop.clients || [];
		const matchedDrivers = drivers.filter((driver) =>
			clientIds.includes(driver.id)
		);
		return matchedDrivers;
	};

	return (
		<div className={styles.page}>
			<Navbar />
			<div className={styles.pageWrap}>
				<div className={styles.rectangleContainer}>
					<Image
						src="/rectangle.png"
						alt="Retângulo título"
						fill
						style={{ objectFit: "cover" }}
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				</div>
				<h1 className={styles.mainTitle}>Cadastramento</h1>
				<p className={styles.subtext}>
					Adicione usuários, organizações e veículos
				</p>
				<Tabs
					aria-label="config-tabs"
					className={styles.tabs}
					disabledKeys={
						(currentUser?.role !== "master" && ["organizations", "users"]) || []
					}
				>
					<Tab
						className={styles.tabButton}
						key="drivers"
						title="Motoristas"
					>
						<div className={styles.driverTab}>
							{drivers.map((driver, key) => (
								<DriverCard
									key={key}
									driver={driver}
									setDrivers={setDrivers}
									setVehicles={setVehicles}
									vehicles={getVehiclesByClient(driver.id)}
								/>
							))}
							<div className={styles.buttonContainer}>
								<DriverModal setDrivers={setDrivers} />
							</div>
						</div>
					</Tab>
					<Tab
						className={styles.tabButton}
						key="organizations"
						title="Organizações"
					>
						<div className={styles.driverTab}>
							{workshops.map((workshop, key) => (
								<OrganizationCard
									drivers={getDriversByWorkshop(workshop.id)}
									key={key}
									workshop={workshop}
									setWorkshops={setWorkshops}
								/>
							))}
							<div className={styles.buttonContainer}>
								<OrganizationModal />
							</div>
						</div>
					</Tab>
					<Tab
						className={styles.tabButton}
						key="users"
						title="Usuários"
					>
						<div className={styles.driverTab}>
							{users.map((driver, key) => (
								<UserCard
									key={key}
									user={driver}
									setUsers={setUsers}
								/>
							))}
							<div className={styles.buttonContainer}>
								<UserModal setUsers={setUsers} />
							</div>
						</div>
					</Tab>
				</Tabs>
			</div>
			<Footer />
		</div>
	);
};

export default Register;
