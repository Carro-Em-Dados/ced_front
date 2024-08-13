import {
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Textarea,
	useDisclosure,
} from "@nextui-org/react";
import clsx from "clsx";
import styles from "../../../register/styles.module.scss";
import DropdownComponent from "@/custom/dropdown/Dropdown";
import { useContext, useState } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "@/contexts/auth.context";
import { toast, Zoom } from "react-toastify";
import { createGoogleEvent } from "@/services/google-calendar";
import { Maintenance } from "@/interfaces/maintenances.type";
import { MaintenanceWithName } from "./customCalendar";

interface Props {
	events: any;
	setEvents: React.Dispatch<React.SetStateAction<any[]>>;
	maintenances: MaintenanceWithName[];
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
	const [selectedMaintenance, setSelectedMaintenance] =
		useState<MaintenanceWithName | null>(null);
	const { db, currentWorkshop } = useContext(AuthContext);

	const createEvent = async () => {
		if (!currentWorkshop) return;

		if (!selectedMaintenance || !selectedMaintenance.id) {
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

		if (newEventStart.getTime() > newEventEnd.getTime()) {
			return toast.error("A data final deve ser superior a data inicial", {
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
				maintenance: selectedMaintenance.id,
				note,
				start: newEventStart,
				end: newEventEnd,
				workshop: currentWorkshop.id,
			};

			if (currentWorkshop.google_calendar_id)
				newEvent.google_event_id =
					(await createGoogleEvent(currentWorkshop.google_calendar_id, {
						end: newEventEnd.toISOString(),
						start: newEventStart.toISOString(),
						summary: `[${currentWorkshop.fantasy_name}] ${selectedMaintenance.name}`,
						description: `Manutenção: ${selectedMaintenance.name}.\nObservações: ${note}.`,
						location: `${currentWorkshop?.address ?? ""} - ${
							currentWorkshop?.city_code ?? ""
						}, ${currentWorkshop?.state_code ?? ""}`,
					})) ?? undefined;

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
			setSelectedMaintenance(null);
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
										<Input
											label="Data de manutenção"
											type="date"
											value={maintenanceDate}
											onChange={(e) => setMaintenanceDate(e.target.value)}
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
									<div className="flex flex-row gap-4">
										<div className="flex flex-col gap-2 w-full">
											<Input
												label="Horário de início"
												type="time"
												value={start}
												onChange={(e) => setStart(e.target.value)}
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
										<div className="flex flex-col gap-2 w-full">
											<Input
												label="Horário de término"
												type="time"
												value={end}
												onChange={(e) => setEnd(e.target.value)}
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
									<div className="flex flex-col gap-2 w-full">
										<Textarea
											placeholder="Observação"
											value={note}
											onChange={(e) => setNote(e.target.value)}
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
