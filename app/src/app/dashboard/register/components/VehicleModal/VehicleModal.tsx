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
import { addDoc, collection } from "firebase/firestore";
import { AuthContext } from "@/contexts/auth.context";

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
			car_model: carModel,
			initial_km: initialKm,
			license_plate: licensePlate,
			vin: vin,
			year: year,
			owner: ownerId,
		};
		const docRef = await addDoc(collection(db, "vehicles"), vehicle).then(
			() => {
				setVehicles((vehicles) => [...vehicles, vehicle]);
				onOpenChange();
			}
		);
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
								<div className={styles.form}>
									<div>
										<input
											className={styles.modalInput}
											placeholder="Fabricante"
											onChange={(e) => setManufacturer(e.target.value)}
										/>
										<span className={styles.horizontalSpace} />
										<input
											className={styles.modalInput}
											placeholder="Modelo"
											onChange={(e) => setCarModel(e.target.value)}
										/>
									</div>
									<div>
										<input
											className={styles.modalInput}
											placeholder="Placa"
											onChange={(e) => setLicensePlate(e.target.value)}
										/>
										<span className={styles.horizontalSpace} />
										<input
											className={styles.modalInput}
											placeholder="Ano"
											onChange={(e) => setYear(Number(e.target.value))}
										/>
									</div>
									<div>
										<input
											className={styles.modalInput}
											placeholder="Odômetro"
											onChange={(e) => setInitialKm(Number(e.target.value))}
										/>
									</div>
									<div>
										<input
											className={styles.modalInput}
											placeholder="Chassi"
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
