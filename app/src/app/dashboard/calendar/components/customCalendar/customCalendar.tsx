"use client";

import moment from "moment";
import {
	Calendar,
	CalendarProps,
	Event,
	momentLocalizer,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles.module.scss";
import { useState } from "react";
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
import CreateEventModal from "./createEventModal";

const localizer = momentLocalizer(moment);

export default function CustomCalendar(
	props: Omit<CalendarProps, "localizer">
) {
	const [events, setEvents] = useState();
	const [selected, setSelected] = useState();
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const handleSelected = (event: any) => {
		setSelected(event);
		onOpen();
	};

	const deleteEvent = () => {
		// deletar o evento selecionado
	};

	return (
		<div className="relative flex flex-col gap-2 mx-24 w-full">
			<CreateEventModal />
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
								Editar evento
							</ModalHeader>
							<ModalBody className="text-white">
								<div className={clsx(styles.form, "flex flex-col gap-4")}></div>
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
								>
									Salvar
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
			<Calendar
				localizer={localizer}
				events={[
					{
						id: 1,
						title: "Teste",
						start: new Date(2024, 7, 8, 8, 0),
						end: new Date(2024, 7, 8, 10, 0),
						allDay: false,
					},
				]}
				views={["week"]}
				defaultView="week"
				allDayAccessor="allDay"
				titleAccessor="title"
				startAccessor="start"
				endAccessor="end"
				selected={selected}
				onSelectEvent={handleSelected}
			/>
		</div>
	);
}
