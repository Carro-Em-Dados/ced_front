import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	useDisclosure,
} from "@nextui-org/react";
import { MdLibraryAdd } from "react-icons/md";
import styles from "../../styles.module.scss";
import clsx from "clsx";

export default function UserModal() {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	return (
		<>
			<Button
				color="success"
				className={styles.button}
				onPress={onOpen}
			>
				<MdLibraryAdd className={styles.addIcon} />
				Adicionar usuário
			</Button>
			<Modal
				isOpen={isOpen}
				className={styles.modal}
				size={"lg"}
				onOpenChange={onOpenChange}
			>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader
								className={clsx("flex flex-col gap-1", styles.modalTitle)}
							>
								Adicionar Usuário
							</ModalHeader>
							<ModalBody>
								<div className={styles.form}>
									<div>
										<input
											className={styles.modalInput}
											placeholder="Nome"
										/>
									</div>
									<div>
										<input
											className={styles.modalInput}
											placeholder="Sobrenome"
										/>
									</div>
									<div>
										<input
											className={styles.modalInput}
											placeholder="E-mail"
										/>
									</div>
									<div>
										<input
											className={styles.modalInput}
											placeholder="Função"
										/>
									</div>
								</div>
							</ModalBody>
							<ModalFooter>
								<Button
									color="danger"
									variant="light"
									onPress={onClose}
								>
									Cancelar
								</Button>
								<Button
									color="success"
									className={styles.modalButton}
									onPress={onClose}
								>
									Adicionar
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
}
