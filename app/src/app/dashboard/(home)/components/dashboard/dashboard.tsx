"use client";

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
import {
	Autocomplete,
	AutocompleteItem,
	Button,
	Radio,
	RadioGroup,
	Select,
	SelectItem,
	Spinner,
} from "@nextui-org/react";

interface DashboardProps {
	selectedWorkshop: string;
	workshopName: string;
}

interface MaintenanceData {
	client: string;
	clientId: string;
	vehicle: string;
	vehicleId: string;
	vehicleBrand: string;
	vehicleModel: string;
	vehicleYear: string;
	maintenance: string;
	km_current: number;
	km_threshold: number;
	date_threshold: string;
	status: string;
	obd2Distance: number;
	gpsDistance: number;
	id?: string;
}

export default function Dashboard({
	selectedWorkshop,
	workshopName,
}: DashboardProps) {
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
	const [filterOptions, setFilterOptions] = useState<any>();
	const [selectedFilterOption, setSelectedFilterOption] = useState({
		selected: "",
		type: "",
	});
	const [filterType, setFilterType] = useState("");
	const [counter, setCounter] = useState("");
	const [filterSum, setFilterSum] = useState(0);

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
					let clientId = "";
					let vehicleInfo = "";
					let vehicleId = "";
					let kmCurrent = 0;
					let vehicleBrand = "";
					let vehicleModel = "";
					let vehicleYear = "";
					let obd2Distance = 0;
					let gpsDistance = 0;

					const vehicleDocRef = doc(db, "vehicles", maintenanceData.car_id);
					const vehicleDoc = await getDoc(vehicleDocRef);
					if (vehicleDoc.exists()) {
						const vehicleData = vehicleDoc.data() as Vehicle;
						vehicleInfo = `${vehicleData.car_model} - ${vehicleData.license_plate}`;
						vehicleId = vehicleDoc.id;
						vehicleBrand = vehicleData.manufacturer || "";
						vehicleModel = vehicleData.car_model || "";
						vehicleYear = vehicleData.year || "";
						obd2Distance = vehicleData.obd2_distance || 0;
						gpsDistance = vehicleData.gps_distance || 0;
						kmCurrent = obd2Distance > gpsDistance ? obd2Distance : gpsDistance;

						if (vehicleData.owner) {
							const appUserDocRef = doc(db, "appUsers", vehicleData.owner);
							const appUserDoc = await getDoc(appUserDocRef);
							if (appUserDoc.exists()) {
								const clientData = appUserDoc.data() as AppUser;
								clientName = clientData.name || "";
								clientId = appUserDoc.id;
							} else {
								const driverDocRef = doc(db, "clients", vehicleData.owner);
								const driverDoc = await getDoc(driverDocRef);
								if (driverDoc.exists()) {
									const driverData = driverDoc.data() as Driver;
									clientName = driverData.name || "";
									clientId = driverDoc.id;
								}
							}
						} else if (selectedWorkshop !== "all") {
							console.warn(
								`Vehicle data missing owner: ${maintenanceData.car_id}`
							);
							continue;
						}
					} else {
						console.warn(
							`Vehicle document not found: ${maintenanceData.car_id}`
						);
					}

					const status = calculateStatus(maintenanceData, kmCurrent);

					maintenanceList.push({
						obd2Distance,
						gpsDistance,
						client: clientName,
						clientId: clientId,
						vehicle: vehicleInfo,
						vehicleId: vehicleId,
						vehicleBrand: vehicleBrand,
						vehicleModel: vehicleModel,
						vehicleYear: vehicleYear,
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
						id: maintenanceData.id,
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
					let clientId = "";
					let vehicleInfo = "";
					let vehicleId = "";
					let kmCurrent = 0;
					let vehicleBrand = "";
					let vehicleModel = "";
					let vehicleYear = "";
					let obd2Distance = 0;
					let gpsDistance = 0;

					const vehicleDocRef = doc(db, "vehicles", maintenanceData.car_id);
					const vehicleDoc = await getDoc(vehicleDocRef);
					if (vehicleDoc.exists()) {
						const vehicleData = vehicleDoc.data() as Vehicle;
						vehicleInfo = `${vehicleData.car_model} - ${vehicleData.license_plate}`;
						vehicleId = vehicleDoc.id;
						vehicleBrand = vehicleData.manufacturer || "";
						vehicleModel = vehicleData.car_model || "";
						vehicleYear = vehicleData.year || "";
						obd2Distance = vehicleData.obd2_distance || 0;
						gpsDistance = vehicleData.gps_distance || 0;
						kmCurrent = obd2Distance > gpsDistance ? obd2Distance : gpsDistance;

						if (vehicleData.owner) {
							const appUserDocRef = doc(db, "appUsers", vehicleData.owner);
							const appUserDoc = await getDoc(appUserDocRef);
							if (appUserDoc.exists()) {
								const clientData = appUserDoc.data() as AppUser;
								clientName = clientData.name || "";
								clientId = appUserDoc.id;
							} else {
								const driverDocRef = doc(db, "clients", vehicleData.owner);
								const driverDoc = await getDoc(driverDocRef);
								if (driverDoc.exists()) {
									const driverData = driverDoc.data() as Driver;
									clientName = driverData.name || "";
									clientId = driverDoc.id;
								}
							}
						} else if (selectedWorkshop !== "all") {
							console.warn(
								`Vehicle data missing owner: ${maintenanceData.car_id}`
							);
							continue;
						}
					} else {
						console.warn(
							`Vehicle document not found: ${maintenanceData.car_id}`
						);
					}

					const status = calculateStatus(maintenanceData, kmCurrent);

					maintenanceList.push({
						client: clientName,
						clientId: clientId,
						vehicle: vehicleInfo,
						vehicleId: vehicleId,
						vehicleBrand: vehicleBrand,
						vehicleModel: vehicleModel,
						vehicleYear: vehicleYear,
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
						obd2Distance,
						gpsDistance,
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
					const obd2Distance = vehicleData?.obd2_distance || 0;
					const gpsDistance = vehicleData?.gps_distance || 0;
					totalKM += obd2Distance > gpsDistance ? obd2Distance : gpsDistance;
				}
				console.log(vehicleData.obd2_distance, vehicleData.gps_distance);
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

	console.log(maintenances);

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

	useEffect(() => {
		getAllVehicleFilters();
	}, [maintenances]);

	const getAllVehicleFilters = async () => {
		const filters = {
			brand: {
				options: {} as {
					[key: string]: {
						maintenances: MaintenanceData[];
						totalKm: number;
						vehiclesCount: number;
					};
				},
			},
			model: {
				options: {} as {
					[key: string]: {
						maintenances: MaintenanceData[];
						totalKm: number;
						vehiclesCount: number;
					};
				},
			},
			year: {
				options: {} as {
					[key: string]: {
						maintenances: MaintenanceData[];
						totalKm: number;
						vehiclesCount: number;
					};
				},
			},
		};

		const vehiclesSnapshot = await getDocs(collection(db, "vehicles"));
		const vehicles = vehiclesSnapshot.docs.map((doc) => doc.data() as Vehicle);

		const uniqueVehicles = new Map<
			string,
			{ brand: string; model: string; year: string; km_current: number }
		>();

		// Processar cada veículo da DB
		vehicles.forEach((vehicle) => {
			const { manufacturer, car_model, year, id, obd2_distance, gps_distance } =
				vehicle;
			const km_current = (obd2_distance || 0) + (gps_distance || 0);

			if (!filters.brand.options[manufacturer]) {
				filters.brand.options[manufacturer] = {
					maintenances: [],
					totalKm: 0,
					vehiclesCount: 0,
				};
			}
			if (!filters.model.options[car_model]) {
				filters.model.options[car_model] = {
					maintenances: [],
					totalKm: 0,
					vehiclesCount: 0,
				};
			}
			if (!filters.year.options[year]) {
				filters.year.options[year] = {
					maintenances: [],
					totalKm: 0,
					vehiclesCount: 0,
				};
			}

			if (!uniqueVehicles.has(id)) {
				uniqueVehicles.set(id, {
					brand: manufacturer,
					model: car_model,
					year,
					km_current,
				});

				filters.brand.options[manufacturer].totalKm += km_current || 0;
				filters.model.options[car_model].totalKm += km_current || 0;
				filters.year.options[year].totalKm += km_current || 0;

				filters.brand.options[manufacturer].vehiclesCount += 1;
				filters.model.options[car_model].vehiclesCount += 1;
				filters.year.options[year].vehiclesCount += 1;
			}
		});

		maintenances.forEach((maintenance) => {
			const { vehicleId } = maintenance;
			const vehicle = uniqueVehicles.get(vehicleId);

			if (vehicle) {
				filters.brand.options[vehicle.brand].maintenances.push(maintenance);
				filters.model.options[vehicle.model].maintenances.push(maintenance);
				filters.year.options[vehicle.year].maintenances.push(maintenance);
			}
		});

		setFilterOptions({
			brand: {
				options: filters.brand.options,
			},
			model: {
				options: filters.model.options,
			},
			year: {
				options: filters.year.options,
			},
		});
	};

	console.log(filterOptions);

	useEffect(() => {
		setSelectedFilterOption({
			selected: "",
			type: "",
		});
		setCounter("");
	}, [counterType]);

	useEffect(() => {
		setCounter("");
	}, [filterType]);

	useEffect(() => {
		sumSelectedKmCounter();
	}, [counter]);

	console.log(counter);

	const sumSelectedKmCounter = async () => {
		let sum = 0;
		const vehiclesSnapshot = await getDocs(collection(db, "vehicles"));
		vehiclesSnapshot.docs.forEach((vehicle: any) => {
			counter === "gps"
				? (sum += vehicle.data().gps_distance || 0)
				: (sum += vehicle.data().obd2_distance || 0);
		});
		setFilterSum(sum);
	};

	console.log(counterType);
	console.log(filterType);

	return (
		<div className={clsx(styles.dashboardContainer, "mb-10")}>
			{loading ? (
				<Spinner color="white" />
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
									<h2 className="text-xl">{workshopName}</h2>
									<p className="text-sm text-[#C7C7C7]">
										Confira as informações referentes à sua oficina nas seções a
										seguir.
									</p>
								</>
							)}
							{counterType === "partial" && (
								<>
									<Select
										variant="bordered"
										className="dark text-white mt-5 w-[26em]"
										classNames={{
											trigger: "!border-white rounded-medium",
											value: "text-white",
										}}
										label="Tipo de filtro"
										selectedKeys={[filterType]}
										defaultSelectedKeys={["data"]}
										onChange={(e) => setFilterType(e.target.value)}
									>
										<SelectItem
											key="data"
											value={"data"}
										>
											Origem dos dados
										</SelectItem>
										<SelectItem
											key="vehicles"
											value={"vehicles"}
										>
											Características dos carros (fabricante, modelo, ano)
										</SelectItem>
									</Select>
									{filterType === "vehicles" ? (
										<div className="flex flex-row gap-5 mt-5">
											<Autocomplete
												label="Marca"
												variant="bordered"
												className="dark"
												defaultItems={[
													{ value: "none", label: "Nenhum" },
													...Object.keys(filterOptions.brand.options).map(
														(brand) => ({
															value: brand.toString(),
															label: brand,
														})
													),
												]}
												onKeyDown={(e: any) => e.continuePropagation()}
												onSelectionChange={(key) => {
													const keyString = key ? key.toString() : "none";
													setSelectedFilterOption({
														selected:
															keyString === "none" ? "" : keyString || "",
														type: keyString === "none" ? "" : "brand",
													});
												}}
												selectedKey={
													selectedFilterOption.type === "brand"
														? selectedFilterOption.selected
														: "none"
												}
											>
												{(item) => (
													<AutocompleteItem
														key={item.value}
														value={item.value}
													>
														{item.label}
													</AutocompleteItem>
												)}
											</Autocomplete>
											<Autocomplete
												label="Modelo"
												variant="bordered"
												className="dark"
												defaultItems={[
													{ value: "none", label: "Nenhum" },
													...Object.keys(filterOptions.model.options).map(
														(model) => ({
															value: model.toString(),
															label: model,
														})
													),
												]}
												onKeyDown={(e: any) => e.continuePropagation()}
												onSelectionChange={(key) => {
													const keyString = key ? key.toString() : "none";
													setSelectedFilterOption({
														selected:
															keyString === "none" ? "" : keyString || "",
														type: keyString === "none" ? "" : "model",
													});
												}}
												selectedKey={
													selectedFilterOption.type === "model"
														? selectedFilterOption.selected
														: "none"
												}
											>
												{(item) => (
													<AutocompleteItem
														key={item.value}
														value={item.value}
													>
														{item.label}
													</AutocompleteItem>
												)}
											</Autocomplete>
											<Autocomplete
												label="Ano"
												variant="bordered"
												className="dark"
												defaultItems={[
													{ value: "none", label: "Nenhum" },
													...Object.keys(filterOptions.year.options).map(
														(year) => ({
															value: year.toString(),
															label: year,
														})
													),
												]}
												onKeyDown={(e: any) => e.continuePropagation()}
												onSelectionChange={(key) => {
													const keyString = key ? key.toString() : "none";
													setSelectedFilterOption({
														selected:
															keyString === "none" ? "" : keyString || "",
														type: keyString === "none" ? "" : "year",
													});
												}}
												selectedKey={
													selectedFilterOption.type === "year"
														? selectedFilterOption.selected
														: "none"
												}
											>
												{(item) => (
													<AutocompleteItem
														key={item.value}
														value={item.value}
													>
														{item.label}
													</AutocompleteItem>
												)}
											</Autocomplete>
										</div>
									) : filterType === "data" ? (
										<>
											<RadioGroup
												className="text-sm mt-5"
												orientation="horizontal"
												color="success"
												value={counter}
												onChange={(e) => {
													setCounter(e.target.value);
												}}
											>
												<Radio value="gps">
													<p className="text-white">GPS</p>
												</Radio>
												<Radio value="obd2">
													<p className="text-white">OBD2</p>
												</Radio>
											</RadioGroup>
										</>
									) : (
										<></>
									)}
								</>
							)}
						</div>
					</div>
					<div className={styles.graphicsContainer}>
						<div className={styles.chartBox}>
							<h4 className={styles.boxText}>Porcentagem de manutenções</h4>
							<CustomChart
								chartData={
									selectedFilterOption.selected !== "" &&
									filterOptions !== undefined
										? countMaintenanceStatuses(
												filterOptions[selectedFilterOption.type]?.options[
													selectedFilterOption.selected
												].maintenances || {}
										  )
										: countMaintenanceStatuses(maintenances)
								}
							/>
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
											{selectedFilterOption.selected !== "" &&
											filterOptions !== undefined
												? filterOptions[selectedFilterOption.type]?.options[
														selectedFilterOption.selected
												  ].maintenances?.length
												: maintenances.length}
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
									<h4 className={styles.statisticsText}>
										{selectedFilterOption.selected !== "" &&
										filterOptions !== undefined
											? filterOptions[selectedFilterOption.type]?.options[
													selectedFilterOption.selected
											  ].vehiclesCount
											: totalVehicles}
									</h4>
								</div>
								<p className={styles.statisticsSubtext}>veículos monitorados</p>
							</div>
							<div className={clsx(styles.statisticsCard, styles.kmCard)}>
								<div className={styles.statWrap}>
									<MdOutlineSpeed className={styles.statisticsIcon} />
									<h4 className={styles.statisticsText}>
										{selectedFilterOption.selected !== "" &&
										filterOptions !== undefined
											? filterOptions[selectedFilterOption.type]?.options[
													selectedFilterOption.selected
											  ].totalKm
											: counter !== ""
											? filterSum
											: totalKM}
									</h4>
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
									}))}
								/>
							</div>
							<div className="flex gap-2">
								<Button
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={currentPage === 0}
									className="bg-gradient-to-b from-[#209730] to-[#056011] text-white"
								>
									Anterior
								</Button>
								<Button
									onClick={() => handlePageChange(currentPage + 1)}
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
