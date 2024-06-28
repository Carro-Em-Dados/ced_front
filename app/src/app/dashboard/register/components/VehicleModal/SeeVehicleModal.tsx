import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Tab,
	Tabs,
	useDisclosure,
} from "@nextui-org/react";
import clsx from "clsx";
import styles from "../../styles.module.scss";
import { useContext, useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { AuthContext } from "@/contexts/auth.context";
import { FaEye } from "react-icons/fa";
import { Vehicle } from "@/interfaces/vehicle.type";
import EditVehicleModal from "./EditVehicleModal";
import EraseModal, { DeleteModalTypes } from "../EraseModal/EraseModal";
import EcuLimits from "./EcuLimits";

interface Props {
	vehicle: Vehicle;
	setVehicles: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function SeeVehicleModal({ vehicle, setVehicles }: Props) {
	const { db } = useContext(AuthContext);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
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
										<p>Fazer</p>
									</Tab>
									<Tab
										className={`${styles.tabButton} !p-0`}
										key="ecu"
										title="Limites ECU"
									>
										<EcuLimits vin={vehicle.vin} />
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
