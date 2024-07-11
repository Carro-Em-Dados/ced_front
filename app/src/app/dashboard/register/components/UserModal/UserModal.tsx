import React, { useState, useContext } from "react";
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	useDisclosure,
	Select,
	SelectItem,
} from "@nextui-org/react";
import { MdLibraryAdd } from "react-icons/md";
import styles from "../../styles.module.scss";
import clsx from "clsx";
import { doc, setDoc } from "firebase/firestore";
import { AuthContext } from "@/contexts/auth.context";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";

interface Props {
	setUsers: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function UserModal({ setUsers }: Props) {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const { db } = useContext(AuthContext);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState("user");

	const addUser = async () => {
		try {
			const auth = getAuth();
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);

			const newUser = {
				email: userCredential.user.email!,
				name: name,
				id: userCredential.user.uid,
				role: role,
				workshops: [],
			};

			const docRef = doc(db, "users", newUser.id);
			await setDoc(docRef, newUser);

			setUsers((prevUsers) => [...prevUsers, newUser]);
			setName("");
			setEmail("");
			setPassword("");
			setRole("user");
			onOpenChange();
		} catch (error: any) {
			console.error(
				`Erro ao adicionar usuário (${error.code}): ${error.message}`
			);
		}
	};

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
											value={name}
											onChange={(e) => setName(e.target.value)}
										/>
									</div>
									<div>
										<input
											className={styles.modalInput}
											placeholder="E-mail"
											type="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
										/>
									</div>
									<div>
										<input
											className={styles.modalInput}
											placeholder="Senha"
											type="password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
										/>
									</div>
									<div>
										<Select
											className="dark"
											label="Tipo de usuário"
											value={role}
											onChange={(e) => setRole(e.target.value)}
										>
											<SelectItem key="user">Usuário</SelectItem>
											<SelectItem key="master">Master</SelectItem>
										</Select>
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
									onPress={addUser}
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
