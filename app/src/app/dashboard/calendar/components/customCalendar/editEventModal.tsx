import {
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Textarea,
} from "@nextui-org/react";
import clsx from "clsx";
import styles from "../../../register/styles.module.scss";
import DeleteEventModal from "./deleteEventModal";
import { useState, useEffect, useContext } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { AuthContext } from "@/contexts/auth.context";
import { toast, Zoom } from "react-toastify";
import { updateGoogleEvent } from "@/services/google-calendar";

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
	const { db, currentWorkshop } = useContext(AuthContext);

	const editSchedule = async () => {
		try {
			const eventRef = doc(db, "schedules", selectedEvent.id);

			const newEventStart = new Date(`${maintenanceDate}T${start}`);
			const newEventEnd = new Date(`${maintenanceDate}T${end}`);

			if (newEventStart.getTime() > newEventEnd.getTime()) {
				return toast.error("Data final deve ser maior que a inicial", {
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

			if (currentWorkshop?.google_calendar_id && selectedEvent?.google_event_id)
				await updateGoogleEvent(
					currentWorkshop.google_calendar_id,
					selectedEvent.google_event_id,
					{
						end: newEventEnd.toISOString(),
						start: newEventStart.toISOString(),
					}
				);

			await updateDoc(eventRef, {
				start: newEventStart,
				end: newEventEnd,
				note: note,
			});

			const updatedEvents = events.map((event: any) =>
				event.id === selectedEvent.id
					? {
							...event,
							start: newEventStart,
							end: newEventEnd,
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

	useEffect(() => {
		const [hours, minutes] = start.split(":").map(Number);
		const startDate = new Date();
		startDate.setHours(hours);
		startDate.setMinutes(minutes);
		startDate.setHours(startDate.getHours() + 2);
		setEnd(startDate.toTimeString().split(" ")[0].substring(0, 5));
	}, [start]);

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
											disabled
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
							<DeleteEventModal
								events={events}
								setEvents={setEvents}
								selectedEvent={selectedEvent}
								onClose={onClose}
							/>
							<Button
								color="success"
								className={styles.modalButton}
								onClick={editSchedule}
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
