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

interface Props {
	events: any;
	setEvents: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function CreateEventModal() {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const createEvent = () => {
		// cria evento da manutenção
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
										/>
									</div>
									<div className="flex flex-row gap-4">
										<div className="flex flex-col gap-2 w-full">
											<p>Horário de início</p>
											<input
												className={styles.modalInput}
												placeholder="Placa"
												type="time"
											/>
										</div>
										<div className="flex flex-col gap-2 w-full">
											<p>Horário de término</p>
											<input
												className={styles.modalInput}
												placeholder="Placa"
												type="time"
											/>
										</div>
									</div>
									<div className="flex flex-col gap-2 w-full">
										<DropdownComponent
											options={[]}
											placeholder="Manutenção"
											value={""}
											onChange={(key) => {}}
										/>
									</div>
									<div className="flex flex-col gap-2 w-full">
										<textarea
											className={styles.modalInput}
											placeholder="Observação"
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
