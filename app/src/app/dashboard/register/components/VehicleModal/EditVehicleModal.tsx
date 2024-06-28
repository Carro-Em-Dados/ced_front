import {
	Button,
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
import { doc, updateDoc } from "firebase/firestore";
import { AuthContext } from "@/contexts/auth.context";
import { Vehicle } from "@/interfaces/vehicle.type";

interface Props {
	vehicle: Vehicle;
	setVehicles: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function EditVehicleModal({ vehicle, setVehicles }: Props) {
	const { db } = useContext(AuthContext);
	//const [manufacturer, setManufacturer] = useState(vehicle.manufacturer || "");
	const [carModel, setCarModel] = useState(vehicle.car_model || "");
	const [initialKm, setInitialKm] = useState(vehicle.initial_km || 0);
	const [licensePlate, setLicensePlate] = useState(vehicle.license_plate || "");
	const [vin, setVin] = useState(vehicle.vin || "");
	const [year, setYear] = useState(vehicle.year || 0);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const updateVehicle = async () => {
		const updatedVehicle = {
			//manufacturer,
			car_model: carModel,
			initial_km: initialKm,
			license_plate: licensePlate,
			vin,
			year,
		};
		const docRef = doc(db, "vehicles", vehicle.id);
		try {
			await updateDoc(docRef, updatedVehicle);
			setVehicles((vehicles) =>
				vehicles.map((v) =>
					v.id === vehicle.id ? { ...v, ...updatedVehicle } : v
				)
			);
			onOpenChange();
		} catch (error) {
			console.error("Error updating vehicle: ", error);
		}
	};

	return (
		<>
			<Button
				color="success"
				className={styles.addVehicleBtn}
				onPress={onOpen}
			>
				Editar carro
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
								Editar carro
							</ModalHeader>
							<ModalBody className="text-white">
								<div className={styles.form}>
									{/* <div>
										<input
											className={styles.modalInput}
											placeholder="Fabricante"
											value={manufacturer}
											onChange={(e) => setManufacturer(e.target.value)}
										/>
										<span className={styles.horizontalSpace} />
										<input
											className={styles.modalInput}
											placeholder="Modelo"
											value={carModel}
											onChange={(e) => setCarModel(e.target.value)}
										/>
									</div> */}
									<div>
										<input
											className={styles.modalInput}
											placeholder="Modelo"
											value={carModel}
											onChange={(e) => setCarModel(e.target.value)}
										/>
										<span className={styles.horizontalSpace} />
										<input
											className={styles.modalInput}
											placeholder="Placa"
											value={licensePlate}
											onChange={(e) => setLicensePlate(e.target.value)}
										/>
									</div>
									<div>
										<input
											className={styles.modalInput}
											placeholder="Ano"
											value={year}
											onChange={(e) => setYear(Number(e.target.value))}
										/>
										<span className={styles.horizontalSpace} />
										<input
											className={styles.modalInput}
											placeholder="Odômetro"
											value={initialKm}
											onChange={(e) => setInitialKm(Number(e.target.value))}
										/>
									</div>
									<div>
										<input
											className={styles.modalInput}
											placeholder="Chassi"
											value={vin}
											onChange={(e) => setVin(e.target.value)}
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
									onPress={updateVehicle}
								>
									Salvar
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
}
