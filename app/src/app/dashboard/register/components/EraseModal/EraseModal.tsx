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
import styles from "../../styles.module.scss";
import { FaRegTrashAlt } from "react-icons/fa";
import { useContext } from "react";
import { AuthContext } from "@/contexts/auth.context";
import { deleteDoc, doc } from "firebase/firestore";

export enum DeleteModalTypes {
	driver = "driver",
	user = "user",
	organization = "organization",
}

interface Props {
	id: string;
	type: DeleteModalTypes;
	name: string;
	state: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function EraseModal({ id, type, name, state }: Props) {
	const { db } = useContext(AuthContext);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const deleteDriver = async () => {
		await deleteDoc(doc(db, "clients", id)).then(() => {
			state((state) => {
				return state.filter((item) => item.id !== id);
			});
			onOpenChange();
		});
	};

	const deleteOrganization = async () => {
		await deleteDoc(doc(db, "workshops", id)).then(() => {
			state((state) => {
				return state.filter((item) => item.id !== id);
			});
			onOpenChange();
		});
	};

	const deleteUsers = async () => {
		await deleteDoc(doc(db, "users", id)).then(() => {
			state((state) => {
				return state.filter((item) => item.id !== id);
			});
			onOpenChange();
		});
	};

	return (
		<>
			<button
				color="success"
				className={styles.deleteBtn}
				onClick={onOpen}
			>
				<FaRegTrashAlt className={styles.addIcon} />
			</button>
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
								Confirmação
							</ModalHeader>
							<ModalBody className="text-white">
								<p>Tem certeza que deseja excluir {name}?</p>
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
									onPress={
										type === DeleteModalTypes.driver
											? deleteDriver
											: type === DeleteModalTypes.organization
											? deleteOrganization
											: deleteDriver
									}
								>
									Excluir
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
}
