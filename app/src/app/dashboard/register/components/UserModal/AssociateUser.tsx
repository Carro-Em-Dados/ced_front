import React, { useState, useContext } from "react";
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	useDisclosure,
} from "@nextui-org/react";
import styles from "../../styles.module.scss";
import clsx from "clsx";
import { AuthContext } from "@/contexts/auth.context";
import { Workshop } from "@/interfaces/workshop.type";
import { User } from "@/interfaces/user.type";
import { updateDoc, doc } from "firebase/firestore";
import { toast, Zoom } from "react-toastify";

interface Props {
	user: User;
	setUsers: React.Dispatch<React.SetStateAction<any[]>>;
	workshops: Workshop[];
}

export default function AssociateUser({ setUsers, workshops, user }: Props) {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const { db } = useContext(AuthContext);
	const [workshop, setWorkshop] = useState(user?.workshops || "");

	const associateUser = async () => {
		if (!workshop) return;

		try {
			const userRef = doc(db, "users", user.id);
			await updateDoc(userRef, { workshops: workshop });
			setUsers((prevUsers) =>
				prevUsers.map((u) =>
					u.id === user.id ? { ...u, workshops: workshop } : u
				)
			);
			setWorkshop("");
			onOpenChange();
		} catch (error) {
			toast.error("Erro ao associar usuário a organização", {
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
				className={styles.addVehicleBtn}
				onPress={onOpen}
			>
				Associar organização
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
								Associar organização
							</ModalHeader>
							<ModalBody>
								<div className="max-h-[400px] overflow-auto flex flex-col gap-1 bg-[#030303] text-white p-2">
									{workshops.map((workshopM) => (
										<div
											key={workshopM.id}
											className={`w-full px-2 py-1 rounded-md cursor-pointer ${
												workshopM.id === workshop
													? "bg-[#209730]"
													: "hover:bg-neutral-800"
											}`}
											onClick={() => setWorkshop(workshopM.id)}
										>
											<p>{workshopM.company_name}</p>
										</div>
									))}
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
									disabled={!workshop}
									className={`${styles.modalButton}`}
									onClick={associateUser}
								>
									Associar
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
}
