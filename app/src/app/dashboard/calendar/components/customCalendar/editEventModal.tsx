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
import DeleteEventModal from "./deleteEventModal";
import { useState, useEffect, useContext } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { AuthContext } from "@/contexts/auth.context";
import { toast, Zoom } from "react-toastify";

interface Props {
	selectedEvent: any;
	events: any;
	setEvents: React.Dispatch<React.SetStateAction<any[]>>;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function EditEventModal({
	selectedEvent,
	events,
	setEvents,
	open,
	setOpen,
}: Props) {
	const [maintenanceDate, setMaintenanceDate] = useState("");
	const [start, setStart] = useState("");
	const [end, setEnd] = useState("");
	const [note, setNote] = useState("");
	const { db } = useContext(AuthContext);

	const editSchedule = async () => {
		try {
			const eventRef = doc(db, "schedules", selectedEvent.id);

			await updateDoc(eventRef, {
				start: new Date(`${maintenanceDate}T${start}:00`),
				end: new Date(`${maintenanceDate}T${end}:00`),
				note: note,
			});

			const updatedEvents = events.map((event: any) =>
				event.id === selectedEvent.id
					? {
							...event,
							start: new Date(`${maintenanceDate}T${start}:00`),
							end: new Date(`${maintenanceDate}T${end}:00`),
							note: note,
					  }
					: event
			);

			setEvents(updatedEvents);
			setOpen(false);
		} catch (error) {
			toast.error("Erro ao editar agendamento", {
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
		if (selectedEvent) {
			setMaintenanceDate(selectedEvent.start.toISOString().split("T")[0]);
			setStart(
				selectedEvent.start.toTimeString().split(" ")[0].substring(0, 5)
			);
			setEnd(selectedEvent.end.toTimeString().split(" ")[0].substring(0, 5));
			setNote(selectedEvent.note);
		}
	}, [selectedEvent]);

	const onClose = () => setOpen(false);

	return (
		<Modal
			isOpen={open}
			className={styles.modal}
			size="2xl"
			onOpenChange={() => setOpen(!open)}
		>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader
							className={clsx("flex flex-col gap-1", styles.modalTitle)}
						>
							Editar evento
						</ModalHeader>
						<ModalBody className="text-white">
							<div className={clsx(styles.form, "flex flex-col gap-4")}>
								<div className="flex flex-col gap-2">
									<p>Data da manutenção</p>
									<input
										className={styles.modalInput}
										placeholder="Placa"
										type="date"
										value={maintenanceDate}
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
											value={start}
											onChange={(e) => setStart(e.target.value)}
										/>
									</div>
									<div className="flex flex-col gap-2 w-full">
										<p>Horário de término</p>
										<input
											className={styles.modalInput}
											placeholder="Placa"
											type="time"
											value={end}
											onChange={(e) => setEnd(e.target.value)}
										/>
									</div>
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
							<DeleteEventModal
								events={events}
								setEvents={setEvents}
								selectedEvent={selectedEvent}
								onClose={onClose}
							/>
							<Button
								color="success"
								className={styles.modalButton}
								onPress={editSchedule}
							>
								Salvar
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
}
