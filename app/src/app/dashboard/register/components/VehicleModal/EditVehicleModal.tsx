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
import { doc, updateDoc } from "firebase/firestore";
import { AuthContext } from "@/contexts/auth.context";
import { Vehicle } from "@/interfaces/vehicle.type";
import { toast, Zoom } from "react-toastify";

interface Props {
	vehicle: Vehicle;
	setVehicles: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function EditVehicleModal({ vehicle, setVehicles }: Props) {
	const { db } = useContext(AuthContext);
	const [manufacturer, setManufacturer] = useState(vehicle.manufacturer || "");
	const [carModel, setCarModel] = useState(vehicle.car_model || "");
	const [initialKm, setInitialKm] = useState(vehicle.initial_km || 0);
	const [licensePlate, setLicensePlate] = useState(vehicle.license_plate || "");
	const [vin, setVin] = useState(vehicle.vin || "");
	const [year, setYear] = useState(vehicle.year || 0);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const updateVehicle = async () => {
		const updatedVehicle = {
			manufacturer,
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
			toast.error("Erro ao editar veículo", {
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
								<div className={clsx(styles.form, "flex flex-col gap-4")}>
									<div>
										<Input
											type="text"
											label="Placa"
											value={licensePlate}
											onChange={(e) => setLicensePlate(e.target.value)}
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
