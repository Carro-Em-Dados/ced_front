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
import styles from "../../../register/styles.module.scss";
import DropdownComponent from "@/custom/dropdown/Dropdown";
import { useContext, useState } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "@/contexts/auth.context";
import { toast, Zoom } from "react-toastify";

interface Props {
	events: any;
	setEvents: React.Dispatch<React.SetStateAction<any[]>>;
	maintenances: any[];
}

export default function CreateEventModal({
	events,
	setEvents,
	maintenances,
}: Props) {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [maintenanceDate, setMaintenanceDate] = useState(() => {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");

		return `${year}-${month}-${day}`;
	});
	const [start, setStart] = useState(
		new Date().toTimeString().split(" ")[0].substring(0, 5)
	);
	const [end, setEnd] = useState(() => {
		const now = new Date();
		const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
		return oneHourLater.toTimeString().split(" ")[0].substring(0, 5);
	});
	const [note, setNote] = useState("");
	const [selectedMaintenance, setSelectedMaintenance] = useState("");
	const { db, currentWorkshop } = useContext(AuthContext);

	const createEvent = async () => {
		if (!currentWorkshop) return;
		if (!selectedMaintenance) {
			toast.error("Por favor, selecione uma manutenção", {
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
			return;
		}

		const newEventStart = new Date(`${maintenanceDate}T${start}`);
		const newEventEnd = new Date(`${maintenanceDate}T${end}`);

		try {
			const q = query(
				collection(db, "schedules"),
				where("workshop", "==", currentWorkshop.id),
				where("start", "<", newEventEnd),
				where("end", ">", newEventStart)
			);

			const querySnapshot = await getDocs(q);
			if (!querySnapshot.empty) {
				toast.error("Conflito de horário com outro agendamento", {
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
				return;
			}

			const newEvent: Schedules = {
				allDay: false,
				maintenance: selectedMaintenance,
				note,
				start: newEventStart,
				end: newEventEnd,
				workshop: currentWorkshop.id,
			};

			const eventRef = await addDoc(collection(db, "schedules"), {
				...newEvent,
			});

			setEvents((prevEvents) => [
				...prevEvents,
				{ id: eventRef.id, title: "Manutenção", ...newEvent },
			]);

			onOpenChange();

			setMaintenanceDate(new Date().toISOString().split("T")[0]);
			setStart(new Date().toTimeString().split(" ")[0].substring(0, 5));
			setEnd(() => {
				const now = new Date();
				const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
				return oneHourLater.toTimeString().split(" ")[0].substring(0, 5);
			});
			setNote("");
			setSelectedMaintenance("");
		} catch (error) {
			toast.error("Erro ao criar agendamento", {
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
				className={clsx(styles.addVehicleBtn, "w-fit")}
				onPress={onOpen}
			>
				Adicionar manutenção
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
								Adicionar manutenção
							</ModalHeader>
							<ModalBody className="text-white">
								<div className={clsx(styles.form, "flex flex-col gap-4")}>
									<div className="flex flex-col gap-2">
										<p>Data da manutenção</p>
										<input
											className={styles.modalInput}
											placeholder="Placa"
											type="date"
											defaultValue={maintenanceDate}
											onChange={(e) => setMaintenanceDate(e.target.value)}
										/>
									</div>
									<div className="flex flex-row gap-4">
										<div className="flex flex-col gap-2 w-full">
											<p>Horário de início</p>
											<input
												className={styles.modalInput}
												placeholder="Placa"
												type="time"
												defaultValue={start}
												onChange={(e) => setStart(e.target.value)}
											/>
										</div>
										<div className="flex flex-col gap-2 w-full">
											<p>Horário de término</p>
											<input
												className={styles.modalInput}
												placeholder="Placa"
												type="time"
												defaultValue={end}
												onChange={(e) => setEnd(e.target.value)}
											/>
										</div>
									</div>
									<div className="flex flex-col gap-2 w-full">
										<DropdownComponent
											options={maintenances.map((maintenance) => {
												return {
													label: maintenance.name as string,
													key: maintenance.id as string,
												};
											})}
											placeholder="Manutenção"
											value={selectedMaintenance}
											onChange={(key) => {
												setSelectedMaintenance(key.toString());
											}}
										/>
									</div>
									<div className="flex flex-col gap-2 w-full">
										<textarea
											className={styles.modalInput}
											placeholder="Observação"
											value={note}
											onChange={(e) => setNote(e.target.value)}
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
									onPress={createEvent}
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
