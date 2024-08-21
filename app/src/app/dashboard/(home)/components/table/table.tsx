"use client";
import React, { useContext, useState } from "react";
import styles from "./table.module.scss";
import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Tooltip,
	Spinner,
} from "@nextui-org/react";
import { Maintenance } from "@/interfaces/maintenances.type";
import {
	collection,
	query,
	where,
	getDocs,
	doc,
	getDoc,
} from "firebase/firestore";
import { Driver } from "@/interfaces/driver.type";
import { AppUser } from "@/interfaces/appUser.type";
import { AuthContext } from "@/contexts/auth.context";
import { Vehicle } from "@/interfaces/vehicle.type";

interface CustomTableProps {
	data: any[];
}

function CustomTable(props: CustomTableProps) {
	const { db } = useContext(AuthContext);
	const [userOpen, setUserOpen] = useState(false);
	const [vehicleOpen, setVehicleOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [userVehicleInfo, setUserVehicleInfo] = useState({
		totalKm: 0,
		criticalCount: 0,
		closeCount: 0,
		expiredCount: 0,
	});
	const [vehicleInfo, setVehicleInfo] = useState({
		vehicleKm: 0,
		criticalCount: 0,
		closeCount: 0,
		expiredCount: 0,
	});

	const handleOpenUser = async (clientId: string) => {
		if (!clientId) {
			return;
		}

		setUserOpen(!userOpen);

		if (!userOpen) {
			setLoading(true);

			try {
				const driverDocRef = doc(db, "clients", clientId);
				const driverDoc = await getDoc(driverDocRef);

				if (!driverDoc.exists()) {
					setLoading(false);
					return;
				}

				let userData: Driver | AppUser | null = null;
				if (driverDoc.exists()) {
					userData = driverDoc.data() as Driver;
				} else {
					const appUserDocRef = doc(db, "appUsers", clientId);
					const appUserDoc = await getDoc(appUserDocRef);
					if (appUserDoc.exists()) {
						userData = appUserDoc.data() as AppUser;
					}
				}

				if (userData) {
					const vehiclesQuery = query(
						collection(db, "vehicles"),
						where("owner", "==", clientId)
					);
					const vehiclesSnapshot = await getDocs(vehiclesQuery);

					let totalKm = 0;
					let criticalCount = 0;
					let closeCount = 0;
					let expiredCount = 0;

					for (const vehicleDoc of vehiclesSnapshot.docs) {
						const vehicleData = vehicleDoc.data() as Vehicle;
						totalKm += vehicleData.initial_km || 0;

						if (vehicleDoc.id) {
							const maintenancesQuery = query(
								collection(db, "maintenances"),
								where("car_id", "==", vehicleDoc.id)
							);
							const maintenancesSnapshot = await getDocs(maintenancesQuery);

							for (const maintenanceDoc of maintenancesSnapshot.docs) {
								const maintenanceData = maintenanceDoc.data() as Maintenance;
								const status = calculateStatus(
									maintenanceData,
									vehicleData.initial_km
								);
								if (status === "Vencida") expiredCount++;
								else if (status === "Crítica") criticalCount++;
								else closeCount++;
							}
						}
					}

					setUserVehicleInfo({
						totalKm,
						criticalCount,
						closeCount,
						expiredCount,
					});
				}
			} catch (error) {
				console.log(error);
			} finally {
				setLoading(false);
			}
		}
	};

	const handleOpenVehicle = async (vehicleId: string) => {
		setVehicleOpen(!vehicleOpen);

		if (!vehicleOpen) {
			setLoading(true);

			try {
				const vehicleDocRef = doc(db, "vehicles", vehicleId);
				const vehicleDoc = await getDoc(vehicleDocRef);

				if (vehicleDoc.exists()) {
					const vehicleData = vehicleDoc.data() as Vehicle;
					const vehicleKm = vehicleData.initial_km || 0;

					const maintenancesQuery = query(
						collection(db, "maintenances"),
						where("car_id", "==", vehicleId)
					);
					const maintenancesSnapshot = await getDocs(maintenancesQuery);
					let criticalCount = 0;
					let closeCount = 0;
					let expiredCount = 0;

					for (const maintenanceDoc of maintenancesSnapshot.docs) {
						const maintenanceData = maintenanceDoc.data() as Maintenance;
						const status = calculateStatus(maintenanceData, vehicleKm);
						if (status === "Vencida") expiredCount++;
						else if (status === "Crítica") criticalCount++;
						else closeCount++;
					}

					setVehicleInfo({
						vehicleKm,
						criticalCount,
						closeCount,
						expiredCount,
					});
				}
			} catch (error) {
				console.error("Erro ao buscar informações do veículo:", error);
			} finally {
				setLoading(false);
			}
		}
	};

	const calculateStatus = (maintenance: Maintenance, kmCurrent: number) => {
		const now = new Date();
		if (maintenance.dateLimit && maintenance.dateLimit < now) {
			return "Vencida";
		} else if (maintenance.kmLimit && maintenance.kmLimit < kmCurrent) {
			return "Crítica";
		}
		return "Próxima";
	};

	return (
		<Table
			aria-label="Maintenance info table"
			className={styles.table}
		>
			<TableHeader className={styles.header}>
				<TableColumn>Cliente</TableColumn>
				<TableColumn>Veículo</TableColumn>
				<TableColumn>Manutenção</TableColumn>
				<TableColumn>Km atual</TableColumn>
				<TableColumn>Km limite</TableColumn>
				<TableColumn>Data limite</TableColumn>
				<TableColumn>Status</TableColumn>
				<TableColumn>Agendamento</TableColumn>
			</TableHeader>
			<TableBody>
				{props.data.map((row, key) => (
					<TableRow key={key}>
						<TableCell className={styles.cell}>
							<Tooltip
								className="dark"
								content={
									<div className="flex flex-col text-white p-2">
										{loading ? (
											<Spinner
												color="white"
												size="sm"
											/>
										) : (
											<>
												<p className="font-bold mb-1">Dados do usuário</p>
												<p>Total KM: {userVehicleInfo.totalKm}</p>
												<p>
													Manutenções Críticas: {userVehicleInfo.criticalCount}
												</p>
												<p>
													Manutenções Próximas: {userVehicleInfo.closeCount}
												</p>
												<p>
													Manutenções Vencidas: {userVehicleInfo.expiredCount}
												</p>
											</>
										)}
									</div>
								}
								onOpenChange={() => handleOpenUser(row.clientId)}
							>
								<p>{row.client}</p>
							</Tooltip>
						</TableCell>
						<TableCell className={styles.cell}>
							<Tooltip
								className="dark"
								content={
									<div className="flex flex-col text-white p-2">
										{loading ? (
											<Spinner
												color="white"
												size="sm"
											/>
										) : (
											<>
												<p className="font-bold mb-1">Dados do veículo</p>
												<p>KM Rodados: {vehicleInfo.vehicleKm}</p>
												<p>Manutenções Críticas: {vehicleInfo.criticalCount}</p>
												<p>Manutenções Próximas: {vehicleInfo.closeCount}</p>
												<p>Manutenções Vencidas: {vehicleInfo.expiredCount}</p>
											</>
										)}
									</div>
								}
								onOpenChange={() => handleOpenVehicle(row.vehicleId)}
							>
								<p>{row.vehicle}</p>
							</Tooltip>
						</TableCell>
						<TableCell className={styles.cell}>{row.maintenance}</TableCell>
						<TableCell className={styles.cell}>{row.km_current}</TableCell>
						<TableCell className={styles.cell}>{row.km_threshold}</TableCell>
						<TableCell className={styles.cell}>{row.date_threshold}</TableCell>
						<TableCell className={styles.cell}>
							<span
								className={`rounded-lg px-2 py-1 ${
									row.status === "Próxima"
										? "!bg-[#D3C544]"
										: row.status === "Crítica"
										? "!bg-[#2D2F2D]"
										: "!bg-[#B73F25]"
								}`}
							>
								{row.status}
							</span>
						</TableCell>
						<TableCell className={styles.cell}>
							<a
								className="text-sky-500 underline"
								href="/dashboard/calendar"
							>
								Agendar
							</a>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

export default CustomTable;
