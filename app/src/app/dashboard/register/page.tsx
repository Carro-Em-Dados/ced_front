"use client";
import React, { useContext, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import Image from "next/image";
import { Tabs, Tab } from "@nextui-org/react";
import DriverCard from "./components/Cards/DriverCard";
import { collection, getDocs } from "firebase/firestore";
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
import { AppUser } from "@/interfaces/appUser.type";
import AppUserCard from "./components/Cards/AppUserCard";
import { useCallback } from "react";

const Register = () => {
	const { db, currentUser } = useContext(AuthContext);
	const [drivers, setDrivers] = useState<Driver[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [workshops, setWorkshops] = useState<Workshop[]>([]);
	const [appUsers, setAppUsers] = useState<AppUser[]>([]);
	const { currentWorkshop } = useContext(AuthContext);

	const fetchData = useCallback(async () => {
		try {
			const clientsSnapshot = await getDocs(collection(db, "clients"));
			const workshopsSnapshot = await getDocs(collection(db, "workshops"));
			const vehiclesSnapshot = await getDocs(collection(db, "vehicles"));
			const appUsersSnapshot = await getDocs(collection(db, "appUsers"));
			let usersSnapshot;
			let filteredClientsData = [];
			let filteredAppUsersData = [];

			if (currentUser?.role !== "master" && currentUser?.workshops) {
				filteredClientsData = clientsSnapshot.docs
					.map(
						(doc) =>
							({
								...doc.data(),
								id: doc.id,
							} as Driver)
					)
					.filter((client) => client.workshops === currentUser.workshops);

				filteredAppUsersData = appUsersSnapshot.docs
					.map(
						(doc) =>
							({
								...doc.data(),
								id: doc.id,
							} as AppUser)
					)
					.filter(
						(appUser) => appUser.preferred_workshop === currentUser.workshops
					);
			} else {
				filteredClientsData = clientsSnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as Driver[];

				filteredAppUsersData = appUsersSnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as AppUser[];
			}

			const workshopsData = workshopsSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Workshop[];

			const vehiclesData = vehiclesSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Vehicle[];

			let usersData;
			if (currentUser?.role !== "worker") {
				usersSnapshot = await getDocs(collection(db, "users"));
				usersData = usersSnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as User[];
			}

			setDrivers(filteredClientsData);
			setWorkshops(workshopsData);
			setUsers(usersData || []);
			setVehicles(vehiclesData);
			setAppUsers(filteredAppUsersData);
		} catch (error) {
			console.error("Error fetching data: ", error);
		}
	}, [db, currentUser]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const getVehiclesByClient = (id: string) => {
		return vehicles.filter((vehicle) => vehicle.owner === id);
	};

	const getDriversByWorkshop = (id: string) => {
		const workshop = workshops.find((workshop) => workshop.id === id);
		if (!workshop) return [];

		return drivers.filter((driver) => driver.workshops === workshop.id);
	};

	const getAppUsersByWorkshop = (id: string) => {
		return appUsers.filter((appUser) => appUser.preferred_workshop === id);
	};

	const getUsersWithoutWorkshop = () => {
		return users.filter(
			(user) =>
				!user.workshops ||
				user.workshops === "" ||
				user.workshops === currentWorkshop?.id
		);
	};

	console.log(users);

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
						currentUser?.role === "master"
							? []
							: currentUser?.role === "workshop"
							? ["organizations"]
							: ["organizations", "users"]
					}
					classNames={{
						tabContent:
							"group-data-[selected=true]:text-white group-data-[disabled=true]:hidden",
					}}
				>
					<Tab
						key="drivers"
						title="Motoristas"
					>
						{currentUser?.workshops && currentUser?.role !== "master" ? (
							<div className={styles.driverTab}>
								{getDriversByWorkshop(currentUser?.workshops).map(
									(driver, key) => (
										<DriverCard
											key={key}
											driver={driver}
											setDrivers={setDrivers}
											setVehicles={setVehicles}
											vehicles={getVehiclesByClient(driver.id)}
										/>
									)
								)}
								{getAppUsersByWorkshop(currentUser?.workshops).map(
									(appUser, key) => (
										<AppUserCard
											key={key}
											appUser={appUser}
											setAppUsers={setAppUsers}
											vehicles={getVehiclesByClient(appUser.id)}
											setVehicles={setVehicles}
										/>
									)
								)}
								<div className={styles.buttonContainer}>
									<DriverModal setDrivers={setDrivers} />
								</div>
							</div>
						) : currentUser?.role === "master" ? (
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
								{appUsers.map((appUser, key) => (
									<AppUserCard
										key={key}
										appUser={appUser}
										setAppUsers={setAppUsers}
										vehicles={getVehiclesByClient(appUser.id)}
										setVehicles={setVehicles}
									/>
								))}
								<div className={styles.buttonContainer}>
									<DriverModal setDrivers={setDrivers} />
								</div>
							</div>
						) : (
							<p className="text-white text-sm">
								Você não tem nenhuma oficina cadastrada.
							</p>
						)}
					</Tab>
					<Tab
						key="organizations"
						title="Organizações"
					>
						<div className={styles.driverTab}>
							{workshops.map((workshop, key) => (
								<OrganizationCard
									workshopDrivers={getDriversByWorkshop(workshop.id)}
									key={key}
									workshop={workshop}
									setWorkshops={setWorkshops}
									setDrivers={setDrivers}
									drivers={drivers}
								/>
							))}
							{currentUser?.role === "master" && (
								<div className={styles.buttonContainer}>
									<OrganizationModal setWorkshops={setWorkshops} />
								</div>
							)}
						</div>
					</Tab>
					<Tab
						className={styles.tabButton}
						key="users"
						title="Usuários"
					>
						<div className={styles.driverTab}>
							{currentUser?.role === "master"
								? users.map((driver, key) => (
										<UserCard
											key={key}
											user={driver}
											setUsers={setUsers}
											workshops={workshops}
										/>
								  ))
								: getUsersWithoutWorkshop().map((driver, key) => (
										<UserCard
											key={key}
											user={driver}
											setUsers={setUsers}
											workshops={workshops}
										/>
								  ))}
							{currentUser?.role === "master" && (
								<div className={styles.buttonContainer}>
									<UserModal setUsers={setUsers} />
								</div>
							)}
						</div>
					</Tab>
				</Tabs>
			</div>
			<Footer />
		</div>
	);
};

export default Register;
