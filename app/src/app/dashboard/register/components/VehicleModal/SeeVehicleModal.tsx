import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	Select,
	SelectItem,
	Tab,
	Tabs,
	useDisclosure,
} from "@nextui-org/react";
import clsx from "clsx";
import styles from "../../styles.module.scss";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/auth.context";
import { FaEye, FaRegEdit } from "react-icons/fa";
import { Vehicle } from "@/interfaces/vehicle.type";
import EditVehicleModal from "./EditVehicleModal";
import EraseModal, { DeleteModalTypes } from "../EraseModal/EraseModal";
import EcuLimits from "./EcuLimits";
import { defaultMaintenance } from "@/constants/defaultMaintenance";
import {
	collection,
	getDocs,
	addDoc,
	Timestamp,
	deleteDoc,
	doc,
	updateDoc,
} from "firebase/firestore";
import { FaRegTrashCan } from "react-icons/fa6";
import { Maintenance } from "@/interfaces/maintenances.type";
import { toast, Zoom } from "react-toastify";

interface Props {
	vehicle: Vehicle;
	setVehicles: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function SeeVehicleModal({ vehicle, setVehicles }: Props) {
	const { db, currentWorkshop } = useContext(AuthContext);
	const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
	const [maintenancesDeleting, setMaintenancesDeleting] = useState<
		Maintenance[]
	>([]);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const fetchMaintenances = async () => {
		try {
			const querySnapshot = await getDocs(collection(db, "maintenances"));
			const maintenanceData: Maintenance[] = [];
			querySnapshot.forEach((doc) => {
				if (doc.data().car_id === vehicle.id) {
					const data = doc.data();
					maintenanceData.push({
						id: doc.id,
						...data,
						dateLimit: data.dateLimit.toDate(),
					} as Maintenance);
				}
			});
			setMaintenances(maintenanceData);
		} catch (error) {
			toast.error("Erro ao buscar manutenções", {
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

	useEffect(() => {
		fetchMaintenances();
	}, []);

	const addMaintenance = () => {
		if (maintenances.length >= currentWorkshop?.contract?.maxAlarmsPerVehicle!)
			return;
		const newMaintenance: Maintenance = {
			service: "",
			workshop: currentWorkshop!.id,
			date: Timestamp.now(),
			price: 0,
			car_id: vehicle.id,
			kmLimit: 0,
			dateLimit: new Date(),
		};
		setMaintenances([...maintenances, newMaintenance]);
	};

	const updateMaintenance = (
		index: number,
		field: keyof Maintenance,
		value: any
	) => {
		const updatedMaintenances = [...maintenances];
		updatedMaintenances[index] = {
			...updatedMaintenances[index],
			[field]: value,
		};
		setMaintenances(updatedMaintenances);
	};

	const saveMaintenancesOnDb = async () => {
		try {
			const existingMaintenancesSnapshot = await getDocs(
				collection(db, "maintenances")
			);
			const existingMaintenances: Maintenance[] = [];
			existingMaintenancesSnapshot.forEach((doc) => {
				if (doc.data().car_id === vehicle.id) {
					existingMaintenances.push({
						id: doc.id,
						...doc.data(),
					} as Maintenance);
				}
			});

			const deletions = maintenancesDeleting.map((m) =>
				m.id ? deleteDoc(doc(db, "maintenances", m.id)) : Promise.resolve()
			);

			const upserts = maintenances.map((maintenance) => {
				if (maintenance.id) {
					return updateDoc(doc(db, "maintenances", maintenance.id), {
						...maintenance,
						dateLimit: Timestamp.fromDate(maintenance.dateLimit),
					});
				} else {
					return addDoc(collection(db, "maintenances"), {
						...maintenance,
						dateLimit: Timestamp.fromDate(maintenance.dateLimit),
					});
				}
			});

			await Promise.all([...deletions, ...upserts]);
			toast.success("Manutenções atualizadas com sucesso", {
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
		} catch (error) {
			toast.error("Erro ao atualizar manutenções", {
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

	const deleteMaintenance = (index: number) => {
		setMaintenances(maintenances.filter((_, i) => i !== index));
		setMaintenancesDeleting([...maintenancesDeleting, maintenances[index]]);
	};

	return (
		<>
			<button
				color="success"
				onClick={onOpen}
			>
				<FaEye />
			</button>
			<Modal
				isOpen={isOpen}
				className={styles.modal}
				size="2xl"
				scrollBehavior="outside"
				onOpenChange={onOpenChange}
			>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader
								className={clsx("flex flex-col gap-1", styles.modalTitle)}
							>
								{vehicle.car_model} - {vehicle.license_plate}
							</ModalHeader>
							<ModalBody className="text-white">
								<Tabs
									aria-label="config-tabs"
									className={`${styles.tabs} !text-xs !m-0`}
								>
									<Tab
										className={`${styles.tabButton} !p-0`}
										key="info"
										title="Informações"
									>
										<div className="flex flex-col gap-2 text-sm">
											<p>
												Placa: <span>{vehicle.license_plate}</span>
											</p>
											<p>
												Marca: <span>{vehicle.car_model}</span>
											</p>
											<p>
												Ano de fabricação: <span>{vehicle.year}</span>
											</p>
											<p>
												Chassi: <span>{vehicle.vin}</span>
											</p>
											<p>
												Odômetro: <span>{vehicle.initial_km}</span>
											</p>
											<div className="flex gap-2 mt-5">
												<EraseModal
													id={vehicle.id}
													type={DeleteModalTypes.vehicle}
													name={vehicle.car_model}
													state={setVehicles}
												/>
												<EditVehicleModal
													vehicle={vehicle}
													setVehicles={setVehicles}
												/>
											</div>
										</div>
									</Tab>
									<Tab
										className={`${styles.tabButton} !p-0`}
										key="alarms"
										title="Manutenções"
									>
										<div className="flex flex-col gap-5 justify-between w-full">
											{maintenances?.map((maintenance, index) => (
												<div
													className="flex flex-row gap-2 items-center"
													key={`${maintenance.id} ${index}`}
												>
													<Select
														className="dark w-52"
														aria-label="maintenance"
														defaultSelectedKeys={[maintenance.service]}
														onChange={(e) =>
															updateMaintenance(
																index,
																"service",
																e.target.value
															)
														}
													>
														{defaultMaintenance.map((maintenance) => (
															<SelectItem
																key={maintenance}
																value={maintenance}
															>
																{maintenance}
															</SelectItem>
														))}
													</Select>
													<input
														type="number"
														id="kmlimit"
														placeholder="KM Limite"
														className={clsx(styles.modalInput, "!w-24")}
														value={maintenance.kmLimit}
														onChange={(e) =>
															updateMaintenance(
																index,
																"kmLimit",
																Number(e.target.value)
															)
														}
														aria-label="kmlimit"
													/>
													<input
														type="date"
														id="date"
														placeholder="Data Limite"
														className={clsx(styles.modalInput, "!w-40")}
														value={
															maintenance.dateLimit.toISOString().split("T")[0]
														}
														onChange={(e) =>
															updateMaintenance(
																index,
																"dateLimit",
																new Date(e.target.value)
															)
														}
														aria-label="date"
													/>
													<input
														type="number"
														id="price"
														placeholder="Valor"
														className={clsx(styles.modalInput, "!w-20")}
														value={maintenance.price}
														onChange={(e) =>
															updateMaintenance(
																index,
																"price",
																Number(e.target.value)
															)
														}
														aria-label="price"
													/>
													<button onClick={() => deleteMaintenance(index)}>
														<FaRegTrashCan />
													</button>
												</div>
											))}
											<Button
												type="button"
												className={clsx(styles.addVehicleBtn, "w-fit")}
												onClick={addMaintenance}
											>
												<FaRegEdit /> Adicionar manutenção
											</Button>
											<div className="flex flex-row justify-between items-center">
												<p className="text-sm">
													{currentWorkshop?.contract?.maxAlarmsPerVehicle! -
														maintenances.length}{" "}
													alarmes restantes
												</p>
												<Button
													type="button"
													className={styles.addVehicleBtn}
													onClick={saveMaintenancesOnDb}
												>
													Salvar
												</Button>
											</div>
										</div>
									</Tab>
									<Tab
										className={`${styles.tabButton} !p-0`}
										key="ecu"
										title="Limites ECU"
									>
										<EcuLimits id={vehicle.id} />
									</Tab>
								</Tabs>
							</ModalBody>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
}
