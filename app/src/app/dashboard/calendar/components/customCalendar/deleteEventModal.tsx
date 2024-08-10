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
import { deleteDoc, doc } from "firebase/firestore";
import { useContext } from "react";
import { AuthContext } from "@/contexts/auth.context";
import { toast, Zoom } from "react-toastify";

interface Props {
	events: any;
	setEvents: React.Dispatch<React.SetStateAction<any[]>>;
	selectedEvent: any;
	onClose: () => void;
}

export default function DeleteEventModal({
	events,
	setEvents,
	selectedEvent,
	onClose,
}: Props) {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const { db } = useContext(AuthContext);

	const deleteEvent = async () => {
		try {
			const eventRef = doc(db, "schedules", selectedEvent.id);
			await deleteDoc(eventRef);

			const updatedEvents = events.filter(
				(event: any) => event.id !== selectedEvent.id
			);
			setEvents(updatedEvents);

			onOpenChange();
			onClose();
		} catch (error) {
			console.log(error);
			toast.error("Erro ao deletar agendamento", {
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
				color="danger"
				onPress={onOpen}
				className="!text-white rounded-full"
			>
				Deletar
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
								Deletar agendamento
							</ModalHeader>
							<ModalBody className="text-white">
								<div className={clsx(styles.form, "flex flex-col gap-4")}>
									<p>Você tem certeza que deseja deletar esse agendamento?</p>
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
									color="danger"
									className="!text-white rounded-full"
									onPress={deleteEvent}
								>
									Deletar
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
}
