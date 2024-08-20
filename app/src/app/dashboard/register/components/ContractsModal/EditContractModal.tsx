"use client";

import { Contract } from "@/interfaces/contract.type";
import {
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Select,
	SelectItem,
	useDisclosure,
} from "@nextui-org/react";
import { useContext, useState } from "react";
import styles from "../../styles.module.scss";
import { AuthContext } from "@/contexts/auth.context";
import { clsx } from "clsx";
import { doc, updateDoc } from "firebase/firestore";
import { toast, Zoom } from "react-toastify";

interface Props {
	contract: Contract;
	setContract: React.Dispatch<React.SetStateAction<Contract | undefined>>;
}

export default function EditContractModal({ contract, setContract }: Props) {
	const { db } = useContext(AuthContext);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [clientMotoristCount, setClientMotoristCount] = useState(
		contract.maxDrivers || 0
	);
	const [vehicleCount, setVehicleCount] = useState(
		contract.maxVehiclesPerDriver || 0
	);
	const [alarmCount, setAlarmCount] = useState(contract.maxAlarmsPerVehicle);
	const [maintenanceAlarmCount, setMaintenanceAlarmCount] = useState(
		contract.maxMaintenanceAlarmsPerUser || 0
	);
	const [workshopKmNotificationFactor, setWorkshopKmNotificationFactor] =
		useState(contract.workshopKmLimitAlarm || 0);
	const [workshopDateNotificationFactor, setWorkshopDateNotificationFactor] =
		useState(contract.workshopDateLimitAlarm || 0);
	const [userKmNotificationFactor, setUserKmNotificationFactor] = useState(
		contract.userKmLimitAlarm || 0
	);
	const [userDateNotificationFactor, setUserDateNotificationFactor] = useState(
		contract.userDateLimitAlarm || 0
	);
	const [loading, setLoading] = useState(false);

	const handleEditContract = async () => {
		const updatedContract = {
			maxDrivers: clientMotoristCount,
			maxVehiclesPerDriver: vehicleCount,
			maxAlarmsPerVehicle: alarmCount,
			maxMaintenanceAlarmsPerUser: maintenanceAlarmCount,
			workshopKmLimitAlarm: workshopKmNotificationFactor,
			workshopDateLimitAlarm: workshopDateNotificationFactor,
			userKmLimitAlarm: userKmNotificationFactor,
			userDateLimitAlarm: userDateNotificationFactor,
		};
		setLoading(true);

		try {
			const contractDocRef = doc(db, "contracts", contract.id);
			await updateDoc(contractDocRef, updatedContract);
			setContract((prevContract) =>
				prevContract ? { ...prevContract, ...updatedContract } : prevContract
			);
			onOpenChange();
		} catch (error) {
			toast.error("Erro ao atualizar contrato", {
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
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Button
				className="w-fit"
				onClick={onOpen}
			>
				Editar contrato
			</Button>
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				className={styles.modal}
				size="2xl"
				scrollBehavior="outside"
			>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader
								className={clsx("flex flex-col gap-1", styles.modalTitle)}
							>
								Editar Contrato
							</ModalHeader>
							<ModalBody>
								<div className={styles.form}>
									<div className="flex flex-col">
										<div>
											<Input
												min={0}
												label="Qtd. cadastros de clientes-motoristas*"
												type="number"
												value={clientMotoristCount.toString()}
												onChange={(e) =>
													setClientMotoristCount(+e.target.value)
												}
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
												min={0}
												label="Qtd. cadastros de veículos por clientes-motoristas*"
												type="number"
												value={vehicleCount.toString()}
												onChange={(e) => setVehicleCount(+e.target.value)}
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
												min={0}
												label="Qtd. de alarmes por KM limite/Data limite por veículo*"
												type="number"
												value={alarmCount.toString()}
												onChange={(e) => setAlarmCount(+e.target.value)}
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
												min={0}
												label="Qtd. de alarmes de manutenção por cliente*"
												type="number"
												value={maintenanceAlarmCount.toString()}
												onChange={(e) =>
													setMaintenanceAlarmCount(+e.target.value)
												}
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
										<p className="self-end text-white text-sm">
											Campos com (*) são obrigatórios
										</p>
									</div>
									<h2 className={styles.modalLabel}>
										Fator de disparo de notificação à oficina
									</h2>
									<fieldset className="text-white flex gap-2">
										<div className="flex flex-col gap-2 w-full">
											<label htmlFor="workshopKmLimitAlarm">KM Limite</label>
											<Select
												name="workshopKmLimitAlarm"
												aria-label="workshopKmLimitAlarm"
												variant="bordered"
												className="dark text-white"
												classNames={{
													trigger: "!border-white rounded-[1em]",
												}}
												value={workshopKmNotificationFactor}
												onChange={(e) =>
													setWorkshopKmNotificationFactor(+e.target.value)
												}
											>
												<SelectItem
													key={"1000"}
													value="1000"
												>
													1000 km
												</SelectItem>
												<SelectItem
													key={"2000"}
													value="2000"
												>
													2000 km
												</SelectItem>
												<SelectItem
													key={"3000"}
													value="3000"
												>
													3000 km
												</SelectItem>
												<SelectItem
													key={"4000"}
													value="4000"
												>
													4000 km
												</SelectItem>
												<SelectItem
													key={"5000"}
													value="5000"
												>
													5000 km
												</SelectItem>
											</Select>
										</div>
										<div className="flex flex-col gap-2 w-full">
											<label htmlFor="workshopDateNotificationFactor">
												Data Limite
											</label>
											<Select
												name="workshopDateNotificationFactor"
												aria-label="workshopDateNotificationFactor"
												variant="bordered"
												className="dark text-white"
												classNames={{
													trigger: "!border-white rounded-[1em]",
												}}
												value={workshopDateNotificationFactor}
												onChange={(e) =>
													setWorkshopDateNotificationFactor(+e.target.value)
												}
											>
												<SelectItem
													key={"1"}
													value="1"
												>
													1 dia
												</SelectItem>
												<SelectItem
													key={"5"}
													value="5"
												>
													5 dias
												</SelectItem>
												<SelectItem
													key={"10"}
													value="10"
												>
													10 dias
												</SelectItem>
												<SelectItem
													key={"15 dias"}
													value="15 dias"
												>
													15 dias
												</SelectItem>
											</Select>
										</div>
									</fieldset>
									<h2>Fator de disparo de notificação ao usuário</h2>
									<fieldset className="text-white flex gap-2">
										<div className="flex flex-col gap-2 w-full">
											<label htmlFor="userKmLimitNotificationFactor">
												KM Limite
											</label>
											<Select
												name="userKmLimitNotificationFactor"
												aria-label="userKmLimitNotificationFactor"
												variant="bordered"
												className="dark text-white"
												classNames={{
													trigger: "!border-white rounded-[1em]",
												}}
												value={userKmNotificationFactor}
												onChange={(e) =>
													setUserKmNotificationFactor(+e.target.value)
												}
											>
												<SelectItem
													key={"200"}
													value="200"
												>
													200 km
												</SelectItem>
												<SelectItem
													key={"400"}
													value="400"
												>
													400 km
												</SelectItem>
												<SelectItem
													key={"600"}
													value="600"
												>
													600 km
												</SelectItem>
												<SelectItem
													key={"800"}
													value="800"
												>
													800 km
												</SelectItem>
												<SelectItem
													key={"1000"}
													value="1000"
												>
													1000 km
												</SelectItem>
											</Select>
										</div>
										<div className="flex flex-col gap-2 w-full">
											<label htmlFor="userDateNotificationFactor">
												Data Limite
											</label>
											<Select
												name="userDateNotificationFactor"
												aria-label="userDateNotificationFactor"
												variant="bordered"
												className="dark text-white"
												classNames={{
													trigger: "!border-white rounded-[1em]",
												}}
												value={userDateNotificationFactor}
												onChange={(e) =>
													setUserDateNotificationFactor(+e.target.value)
												}
											>
												<SelectItem
													key={"1"}
													value="1"
												>
													1 dia
												</SelectItem>
												<SelectItem
													key={"2"}
													value="2"
												>
													2 dias
												</SelectItem>
												<SelectItem
													key={"4"}
													value="4"
												>
													4 dias
												</SelectItem>
												<SelectItem
													key={"6"}
													value="6"
												>
													6 dias
												</SelectItem>
												<SelectItem
													key={"8"}
													value="8"
												>
													8 dias
												</SelectItem>
												<SelectItem
													key={"10"}
													value="10"
												>
													10 dias
												</SelectItem>
											</Select>
										</div>
									</fieldset>
								</div>
							</ModalBody>
							<ModalFooter>
								<Button
									color="danger"
									variant="light"
									onClick={onClose}
								>
									Cancelar
								</Button>
								<Button
									color="success"
									className={styles.modalButton}
									disabled={loading}
									onClick={() => {
										handleEditContract();
										onClose();
									}}
								>
									Editar
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
}
