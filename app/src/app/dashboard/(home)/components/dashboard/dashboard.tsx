import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	where,
	limit,
	startAfter,
	orderBy,
} from "firebase/firestore";
import { useState, useEffect, useContext } from "react";
import { Maintenance } from "@/interfaces/maintenances.type";
import { AppUser } from "@/interfaces/appUser.type";
import { Driver } from "@/interfaces/driver.type";
import { Vehicle } from "@/interfaces/vehicle.type";
import { AuthContext } from "@/contexts/auth.context";
import CustomTable from "../table/table";
import CustomChart from "../chart/chart";
import styles from "../../tabs/welcome.module.scss";
import clsx from "clsx";
import { TbClockExclamation } from "react-icons/tb";
import { MdDirectionsCar, MdOutlineSpeed } from "react-icons/md";
import { Button, Radio, RadioGroup } from "@nextui-org/react";
import { AiOutlineLoading } from "react-icons/ai";

interface DashboardProps {
	selectedWorkshop: string;
}

interface MaintenanceData {
	client: string;
	vehicle: string;
	maintenance: string;
	km_current: number;
	km_threshold: number;
	date_threshold: string;
	status: string;
	appointment?: string;
}

export default function Dashboard({ selectedWorkshop }: DashboardProps) {
	const { db } = useContext(AuthContext);
	const [maintenances, setMaintenances] = useState<MaintenanceData[]>([]);
	const [currentPage, setCurrentPage] = useState(0);
	const [lastVisible, setLastVisible] = useState<any>(null);
	const [totalPending, setTotalPending] = useState(0);
	const [totalVehicles, setTotalVehicles] = useState(0);
	const [totalKM, setTotalKM] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [counterType, setCounterType] = useState("total");
	const [loading, setLoading] = useState(true);

	const itemsPerPage = 10;

	const fetchMaintenances = async () => {
		if (!db) {
			console.error("Database not initialized");
			return;
		}

		try {
			setLoading(true);
			let baseQuery;

			if (selectedWorkshop === "all") {
				baseQuery = query(collection(db, "maintenances"));
			} else {
				baseQuery = query(
					collection(db, "maintenances"),
					where("workshop", "==", selectedWorkshop)
				);
			}

			const countSnapshot = await getDocs(baseQuery);
			const totalItems = countSnapshot.size;
			setTotalPages(Math.ceil(totalItems / itemsPerPage));

			if (selectedWorkshop === "all") {
				const querySnapshot = await getDocs(baseQuery);
				const maintenanceList: MaintenanceData[] = [];

				for (const docSnap of querySnapshot.docs) {
					const maintenanceData = docSnap.data() as Maintenance;
					maintenanceData.id = docSnap.id;

					if (!maintenanceData.car_id) {
						console.warn(
							`Maintenance data missing car_id: ${maintenanceData.id}`
						);
						continue;
					}

					let clientName = "";
					let vehicleInfo = "";
					let kmCurrent = 0;

					const vehicleDocRef = doc(db, "vehicles", maintenanceData.car_id);
					const vehicleDoc = await getDoc(vehicleDocRef);
					if (vehicleDoc.exists()) {
						const vehicleData = vehicleDoc.data() as Vehicle;
						vehicleInfo = `${vehicleData.car_model} - ${vehicleData.license_plate}`;
						kmCurrent = vehicleData.initial_km || 0;

						if (!vehicleData.owner && selectedWorkshop !== "all") {
							console.warn(
								`Vehicle data missing owner: ${maintenanceData.car_id}`
							);
							continue;
						}

						const appUserDocRef = doc(db, "appUsers", vehicleData.owner);
						const appUserDoc = await getDoc(appUserDocRef);
						if (appUserDoc.exists()) {
							const clientData = appUserDoc.data() as AppUser;
							clientName = clientData.name || "";
						}

						const driverDocRef = doc(db, "clients", vehicleData.owner);
						const driverDoc = await getDoc(driverDocRef);
						if (driverDoc.exists()) {
							const driverData = driverDoc.data() as Driver;
							clientName = driverData.name || "";
						}
					} else {
						console.warn(
							`Vehicle document not found: ${maintenanceData.car_id}`
						);
					}

					const status = calculateStatus(maintenanceData, kmCurrent);

					maintenanceList.push({
						client: clientName,
						vehicle: vehicleInfo,
						maintenance: maintenanceData.service,
						km_current: kmCurrent,
						km_threshold: maintenanceData.kmLimit || 0,
						date_threshold: maintenanceData.dateLimit
							? new Date(
									maintenanceData.dateLimit.seconds * 1000 +
										maintenanceData.dateLimit.nanoseconds / 1000000
							  ).toLocaleDateString("pt-BR")
							: "",
						status: status,
					});
				}

				setMaintenances(maintenanceList);
				setTotalPending(totalItems);
			} else {
				let q = query(
					baseQuery,
					orderBy("date"),
					limit(itemsPerPage),
					lastVisible ? startAfter(lastVisible) : limit(itemsPerPage)
				);

				const querySnapshot = await getDocs(q);
				const maintenanceList: MaintenanceData[] = [];

				for (const docSnap of querySnapshot.docs) {
					const maintenanceData = docSnap.data() as Maintenance;
					maintenanceData.id = docSnap.id;

					if (!maintenanceData.car_id) {
						console.warn(
							`Maintenance data missing car_id: ${maintenanceData.id}`
						);
						continue;
					}

					let clientName = "";
					let vehicleInfo = "";
					let kmCurrent = 0;

					const vehicleDocRef = doc(db, "vehicles", maintenanceData.car_id);
					const vehicleDoc = await getDoc(vehicleDocRef);
					if (vehicleDoc.exists()) {
						const vehicleData = vehicleDoc.data() as Vehicle;
						vehicleInfo = `${vehicleData.car_model} - ${vehicleData.license_plate}`;
						kmCurrent = vehicleData.initial_km || 0;

						if (!vehicleData.owner && selectedWorkshop !== "all") {
							console.warn(
								`Vehicle data missing owner: ${maintenanceData.car_id}`
							);
							continue;
						}

						const appUserDocRef = doc(db, "appUsers", vehicleData.owner);
						const appUserDoc = await getDoc(appUserDocRef);
						if (appUserDoc.exists()) {
							const clientData = appUserDoc.data() as AppUser;
							clientName = clientData.name || "";
						}

						const driverDocRef = doc(db, "clients", vehicleData.owner);
						const driverDoc = await getDoc(driverDocRef);
						if (driverDoc.exists()) {
							const driverData = driverDoc.data() as Driver;
							clientName = driverData.name || "";
						}
					} else {
						console.warn(
							`Vehicle document not found: ${maintenanceData.car_id}`
						);
					}

					const status = calculateStatus(maintenanceData, kmCurrent);

					maintenanceList.push({
						client: clientName,
						vehicle: vehicleInfo,
						maintenance: maintenanceData.service,
						km_current: kmCurrent,
						km_threshold: maintenanceData.kmLimit || 0,
						date_threshold: maintenanceData.dateLimit
							? new Date(
									maintenanceData.dateLimit.seconds * 1000 +
										maintenanceData.dateLimit.nanoseconds / 1000000
							  ).toLocaleDateString("pt-BR")
							: "",
						status: status,
					});
				}

				setMaintenances(maintenanceList);
				setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
				setTotalPending(totalItems);
			}
		} catch (error) {
			console.error("Error fetching maintenances: ", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchMonitoredVehicles = async () => {
		if (!db) {
			console.error("Database not initialized");
			return;
		}

		try {
			let vehiclesSnapshot;

			if (selectedWorkshop === "all") {
				vehiclesSnapshot = await getDocs(collection(db, "vehicles"));
			} else {
				vehiclesSnapshot = await getDocs(
					query(collection(db, "vehicles"), where("owner", "!=", null))
				);
			}

			let monitoredVehicles = 0;
			let totalKM = 0;

			for (const vehicleDoc of vehiclesSnapshot.docs) {
				const vehicleData = vehicleDoc.data() as Vehicle;
				const ownerId = vehicleData.owner;

				if (!ownerId && selectedWorkshop !== "all") {
					console.warn(`Vehicle data missing owner: ${vehicleData.id}`);
					continue;
				}

				let isAssociated = false;

				if (ownerId) {
					const appUserDocRef = doc(db, "appUsers", ownerId);
					const appUserDoc = await getDoc(appUserDocRef);
					if (appUserDoc.exists()) {
						const appUserData = appUserDoc.data() as AppUser;
						if (appUserData.preferred_workshop === selectedWorkshop) {
							isAssociated = true;
						}
					}

					const driverDocRef = doc(db, "clients", ownerId);
					const driverDoc = await getDoc(driverDocRef);
					if (driverDoc.exists()) {
						const driverData = driverDoc.data() as Driver;
						if (driverData.workshops === selectedWorkshop) {
							isAssociated = true;
						}
					}
				} else {
					isAssociated = selectedWorkshop === "all";
				}

				if (selectedWorkshop === "all" || isAssociated) {
					monitoredVehicles++;
					totalKM += vehicleData.initial_km || 0;
				}
			}

			setTotalVehicles(monitoredVehicles);
			setTotalKM(totalKM);
		} catch (error) {
			console.error("Error fetching monitored vehicles: ", error);
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

	const handlePageChange = (page: number) => {
		if (page < 0 || page >= totalPages) return;
		setCurrentPage(page);
		fetchMaintenances();
	};

	const countMaintenanceStatuses = (maintenances: MaintenanceData[]) => {
		let criticalCount = 0;
		let upcomingCount = 0;
		let overdueCount = 0;

		maintenances.forEach((maintenance) => {
			switch (maintenance.status) {
				case "Crítica":
					criticalCount++;
					break;
				case "Próxima":
					upcomingCount++;
					break;
				case "Vencida":
					overdueCount++;
					break;
				default:
					break;
			}
		});

		return {
			critical: criticalCount,
			upcoming: upcomingCount,
			overdue: overdueCount,
		};
	};

	useEffect(() => {
		setMaintenances([]);
		setCurrentPage(0);
		setLastVisible(null);
		fetchMaintenances();
		fetchMonitoredVehicles();
		setCounterType("total");
	}, [selectedWorkshop]);

	return (
		<div className={clsx(styles.dashboardContainer, "mb-10")}>
			{loading ? (
				<AiOutlineLoading
					size={40}
					className="text-white animate-spin"
				/>
			) : (
				<>
					<div
						className={clsx(
							styles.dashboardTitleContainer,
							"text-white flex flex-col gap-2"
						)}
					>
						<div className="w-6 h-2 bg-[#27A338]" />
						<div className="flex flex-col">
							{selectedWorkshop === "all" ? (
								<>
									<h1 className="text-3xl">Geral</h1>
									<RadioGroup
										className="text-sm"
										label="Selecione abaixo sua opção de visualização."
										orientation="horizontal"
										color="success"
										value={counterType}
										onChange={(e) => {
											setCounterType(e.target.value);
										}}
									>
										<Radio value="total">
											<p className="text-white">Contadores totais</p>
										</Radio>
										<Radio value="partial">
											<p className="text-white">Contadores parciais</p>
										</Radio>
									</RadioGroup>
								</>
							) : (
								<>
									<h2 className="text-xl">Nome da oficina</h2>
									<p className="text-sm text-[#C7C7C7]">
										Confira as informações referentes à sua oficina nas seções a
										seguir.
									</p>
								</>
							)}
						</div>
					</div>
					<div className={styles.graphicsContainer}>
						<div className={styles.chartBox}>
							<h4 className={styles.boxText}>Porcentagem de manutenções</h4>
							<CustomChart chartData={countMaintenanceStatuses(maintenances)} />
						</div>
						<span style={{ width: "3em" }} />
						<div className={styles.statisticsBox}>
							<h4 className={styles.boxText}>Outros dados</h4>
							{counterType === "total" && (
								<div
									className={clsx(
										styles.statisticsCard,
										styles.maintenanceCard
									)}
								>
									<div className={styles.statWrap}>
										<TbClockExclamation className={styles.statisticsIcon} />
										<h4 className={styles.statisticsText}>
											{maintenances.length}
										</h4>
									</div>
									<p className={styles.statisticsSubtext}>
										manutenções pendentes
									</p>
								</div>
							)}
							<div className={clsx(styles.statisticsCard, styles.vehiclesCard)}>
								<div className={styles.statWrap}>
									<MdDirectionsCar className={styles.statisticsIcon} />
									<h4 className={styles.statisticsText}>{totalVehicles}</h4>
								</div>
								<p className={styles.statisticsSubtext}>veículos monitorados</p>
							</div>
							<div className={clsx(styles.statisticsCard, styles.kmCard)}>
								<div className={styles.statWrap}>
									<MdOutlineSpeed className={styles.statisticsIcon} />
									<h4 className={styles.statisticsText}>{totalKM}</h4>
								</div>
								<p className={styles.statisticsSubtext}>km monitorados</p>
							</div>
						</div>
					</div>
					{selectedWorkshop !== "all" && (
						<>
							<div className={styles.tableContainer}>
								<CustomTable
									data={maintenances.map((row) => ({
										...row,
										appointment: "Agendar",
									}))}
								/>
							</div>
							<div className="flex gap-2">
								<Button
									onPress={() => handlePageChange(currentPage - 1)}
									disabled={currentPage === 0}
									className="bg-gradient-to-b from-[#209730] to-[#056011] text-white"
								>
									Anterior
								</Button>
								<Button
									onPress={() => handlePageChange(currentPage + 1)}
									disabled={currentPage >= totalPages - 1}
									className="bg-gradient-to-b from-[#209730] to-[#056011] text-white"
								>
									Próxima
								</Button>
							</div>
						</>
					)}
				</>
			)}
		</div>
	);
}
