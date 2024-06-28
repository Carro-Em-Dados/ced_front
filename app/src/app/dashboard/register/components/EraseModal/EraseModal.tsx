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
	vehicle = "vehicle",
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

	const deleteItem = async () => {
		let collectionName;
		switch (type) {
			case DeleteModalTypes.driver:
				collectionName = "clients";
				break;
			case DeleteModalTypes.user:
				collectionName = "users";
				break;
			case DeleteModalTypes.organization:
				collectionName = "workshops";
				break;
			case DeleteModalTypes.vehicle:
				collectionName = "vehicles";
				break;
			default:
				throw new Error("Invalid delete type");
		}

		await deleteDoc(doc(db, collectionName, id))
			.then(() => {
				state((prevState) => prevState.filter((item) => item.id !== id));
				onOpenChange();
			})
			.catch((error) => {
				console.error("Error deleting document: ", error);
			});
	};

	return (
		<>
			<Button
				className={styles.deleteBtn}
				onClick={onOpen}
			>
				<FaRegTrashAlt />
				Excluir
			</Button>
			<Modal
				isOpen={isOpen}
				className={styles.modal}
				size="lg"
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
									color="danger"
									className={styles.modalButton}
									onPress={deleteItem}
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
