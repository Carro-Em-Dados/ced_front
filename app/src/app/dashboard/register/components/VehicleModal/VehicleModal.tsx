import {
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	useDisclosure,
} from "@nextui-org/react";
import clsx from "clsx";
import styles from "../../styles.module.scss";
import { useContext, useState } from "react";
import {
	addDoc,
	collection,
	query,
	where,
	getDocs,
	updateDoc,
	doc,
} from "firebase/firestore";
import { AuthContext } from "@/contexts/auth.context";
import { toast, Zoom } from "react-toastify";

interface Props {
	ownerId: string;
	setVehicles: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function VehicleModal({ ownerId, setVehicles }: Props) {
	const { db } = useContext(AuthContext);
	const [manufacturer, setManufacturer] = useState("");
	const [carModel, setCarModel] = useState("");
	const [initialKm, setInitialKm] = useState(0);
	const [licensePlate, setLicensePlate] = useState("");
	const [vin, setVin] = useState("");
	const [year, setYear] = useState(0);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const addVehicle = async () => {
		let vehicle = {
			manufacturer: manufacturer,
			car_model: carModel,
			initial_km: initialKm,
			license_plate: licensePlate,
			vin: vin,
			year: year,
			owner: ownerId,
		};

		try {
			const q = query(
				collection(db, "vehicles"),
				where("license_plate", "==", licensePlate)
			);
			const querySnapshot = await getDocs(q);

			if (!querySnapshot.empty) {
				const existingVehicleDoc = querySnapshot.docs[0];
				const existingVehicle = existingVehicleDoc.data();

				if (existingVehicle.owner) {
					toast.error(
						"Já existe um veículo com a mesma placa associado a um proprietário",
						{
							position: "bottom-right",
							autoClose: 5000,
							hideProgressBar: true,
							closeOnClick: true,
							pauseOnHover: true,
							draggable: true,
							progress: undefined,
							theme: "dark",
							transition: Zoom,
						}
					);
					return;
				}

				const updatedVehicle = {
					manufacturer: manufacturer || existingVehicle.manufacturer,
					car_model: carModel || existingVehicle.car_model,
					initial_km: initialKm || existingVehicle.initial_km,
					license_plate: licensePlate,
					vin: vin || existingVehicle.vin,
					year: year || existingVehicle.year,
					owner: ownerId,
				};

				await updateDoc(
					doc(db, "vehicles", existingVehicleDoc.id),
					updatedVehicle
				);

				setVehicles((vehicles) =>
					vehicles.map((veh) =>
						veh.id === existingVehicleDoc.id
							? { ...veh, ...updatedVehicle }
							: veh
					)
				);
				onOpenChange();
				return;
			}

			const docRef = await addDoc(collection(db, "vehicles"), vehicle);
			setVehicles((vehicles) => [...vehicles, { ...vehicle, id: docRef.id }]);
			onOpenChange();
		} catch (error) {
			toast.error("Erro ao adicionar veículo", {
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

	const queryVehicles = async () => {
		try {
			const q = query(
				collection(db, "vehicles"),
				where("license_plate", "==", licensePlate),
				where("owner", "==", "")
			);
			const querySnapshot = await getDocs(q);
			if (!querySnapshot.empty) {
				querySnapshot.forEach((doc) => {
					const vehicleData = doc.data();
					setManufacturer(vehicleData.manufacturer || "");
					setCarModel(vehicleData.car_model || "");
					setVin(vehicleData.vin || "");
					setYear(vehicleData.year || 0);
					setInitialKm(vehicleData.initial_km || 0);
				});
			} else {
				setManufacturer("");
				setCarModel("");
				setVin("");
				setYear(0);
				setInitialKm(0);
			}
		} catch (error) {
			toast.error("Erro ao buscar veículos", {
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
		<>
			<Button
				color="success"
				className={styles.addVehicleBtn}
				onPress={onOpen}
			>
				Adicionar carro
			</Button>
			<Modal
				isOpen={isOpen}
				className={styles.modal}
				size="2xl"
				onOpenChange={onOpenChange}
			>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader
								className={clsx("flex flex-col gap-1", styles.modalTitle)}
							>
								Adicionar carro
							</ModalHeader>
							<ModalBody className="text-white">
								<div className={clsx(styles.form, "flex flex-col gap-4")}>
									<div>
										<Input
											type="text"
											label="Placa"
											value={licensePlate}
											onChange={(e) => setLicensePlate(e.target.value)}
											onBlur={queryVehicles}
											variant="bordered"
											className="dark"
											classNames={{
												input: ["bg-transparent text-white"],
												inputWrapper: [
													"border border-2 !border-white focus:border-white",
												],
											}}
										/>
									</div>
									<div className="flex gap-5">
										<Input
											type="text"
											label="Fabricante"
											value={manufacturer}
											onChange={(e) => setManufacturer(e.target.value)}
											variant="bordered"
											className="dark"
											classNames={{
												input: ["bg-transparent text-white"],
												inputWrapper: [
													"border border-2 !border-white focus:border-white",
												],
											}}
										/>
										<Input
											type="text"
											label="Modelo"
											value={carModel}
											onChange={(e) => setCarModel(e.target.value)}
											variant="bordered"
											className="dark"
											classNames={{
												input: ["bg-transparent text-white"],
												inputWrapper: [
													"border border-2 !border-white focus:border-white",
												],
											}}
										/>
									</div>
									<div className="flex gap-5">
										<Input
											type="text"
											label="Chassi"
											value={vin}
											onChange={(e) => setVin(e.target.value)}
											variant="bordered"
											className="dark"
											classNames={{
												input: ["bg-transparent text-white"],
												inputWrapper: [
													"border border-2 !border-white focus:border-white",
												],
											}}
										/>
										<Input
											type="number"
											label="Ano"
											min="1900"
											max="2099"
											step="1"
											value={year.toString()}
											onChange={(e) => setYear(Number(e.target.value))}
											variant="bordered"
											className="dark"
											classNames={{
												input: ["bg-transparent text-white"],
												inputWrapper: [
													"border border-2 !border-white focus:border-white",
												],
											}}
										/>
									</div>
									<div>
										<Input
											type="number"
											min={0}
											label="Odômetro"
											value={initialKm.toString()}
											onChange={(e) => setInitialKm(Number(e.target.value))}
											variant="bordered"
											className="dark"
											classNames={{
												input: ["bg-transparent text-white"],
												inputWrapper: [
													"border border-2 !border-white focus:border-white",
												],
											}}
										/>
									</div>
								</div>
							</ModalBody>
							<ModalFooter>
								<Button
									color="default"
									variant="light"
									onPress={onClose}
									className="!text-white rounded-full"
								>
									Cancelar
								</Button>
								<Button
									color="success"
									className={styles.modalButton}
									onPress={addVehicle}
								>
									Adicionar
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
}
