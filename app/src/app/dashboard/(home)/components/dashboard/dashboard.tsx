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

	const itemsPerPage = 10;

	const fetchMaintenances = async () => {
		if (!db) {
			console.error("Database not initialized");
			return;
		}

		try {
			let q = query(
				collection(db, "maintenances"),
				where("workshop", "==", selectedWorkshop),
				orderBy("date"),
				limit(itemsPerPage)
			);

			if (lastVisible) {
				q = query(q, startAfter(lastVisible));
			}

			const querySnapshot = await getDocs(q);
			const maintenanceList: MaintenanceData[] = [];
			const vehiclesMonitorados: Set<string> = new Set();
			let kmMonitorado = 0;

			for (const docSnap of querySnapshot.docs) {
				const maintenanceData = docSnap.data() as Maintenance;
				maintenanceData.id = docSnap.id;

				let clientName = "";
				let vehicleInfo = "";
				let kmCurrent = 0;

				const vehicleDoc = await getDoc(
					doc(db, "vehicles", maintenanceData.car_id)
				);
				if (vehicleDoc.exists()) {
					const vehicleData = vehicleDoc.data() as Vehicle;
					vehicleInfo = `${vehicleData.car_model} - ${vehicleData.license_plate}`;
					kmCurrent = vehicleData.initial_km;

					// Check if the vehicle is associated with an AppUser or Driver
					const appUserDoc = await getDoc(
						doc(db, "appUsers", maintenanceData.car_id)
					);
					const driverDoc = await getDoc(
						doc(db, "clients", maintenanceData.car_id)
					);

					if (appUserDoc.exists()) {
						const clientData = appUserDoc.data() as AppUser;
						clientName = clientData.name;
						if (clientData.preferred_workshop === selectedWorkshop) {
							vehiclesMonitorados.add(maintenanceData.car_id);
							kmMonitorado += vehicleData.initial_km;
						}
					} else if (driverDoc.exists()) {
						const driverData = driverDoc.data() as Driver;
						clientName = driverData.name;
						if (driverData.workshops === selectedWorkshop) {
							vehiclesMonitorados.add(maintenanceData.car_id);
							kmMonitorado += vehicleData.initial_km;
						}
					}
				}

				const status = calculateStatus(maintenanceData, kmCurrent);

				maintenanceList.push({
					client: clientName,
					vehicle: vehicleInfo,
					maintenance: maintenanceData.service,
					km_current: kmCurrent,
					km_threshold: maintenanceData.kmLimit,
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
			setTotalPending(maintenanceList.length);
			setTotalVehicles(vehiclesMonitorados.size);
			setTotalKM(kmMonitorado);
		} catch (error) {
			console.error("Error fetching maintenances: ", error);
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
		setCurrentPage(page);
		fetchMaintenances();
	};

	useEffect(() => {
		fetchMaintenances();
	}, [selectedWorkshop]);

	return (
		<div className={styles.dashboardContainer}>
			<div className={styles.dashboardTitleContainer}>
				<h2 className={styles.dashboardTitle}>{selectedWorkshop}</h2>
				<p className={styles.dashboardText}>
					Confira as informações referentes à sua oficina nas seções a seguir.
				</p>
			</div>
			<div className={styles.graphicsContainer}>
				<div className={styles.chartBox}>
					<h4 className={styles.boxText}>Porcentagem de manutenções</h4>
					<CustomChart />
				</div>
				<span style={{ width: "3em" }} />
				<div className={styles.statisticsBox}>
					<h4 className={styles.boxText}>Outros dados</h4>
					<div className={clsx(styles.statisticsCard, styles.maintenanceCard)}>
						<div className={styles.statWrap}>
							<TbClockExclamation className={styles.statisticsIcon} />
							<h4 className={styles.statisticsText}>{totalPending}</h4>
						</div>
						<p className={styles.statisticsSubtext}>manutenções pendentes</p>
					</div>
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
			<div className={styles.tableContainer}>
				<CustomTable
					data={maintenances.map((row) => ({
						...row,
						appointment: "Agendar",
					}))}
				/>
			</div>
			<div className={styles.pagination}>
				<button
					onClick={() => handlePageChange(currentPage - 1)}
					disabled={currentPage === 0}
				>
					Anterior
				</button>
				<button onClick={() => handlePageChange(currentPage + 1)}>
					Próxima
				</button>
			</div>
		</div>
	);
}
