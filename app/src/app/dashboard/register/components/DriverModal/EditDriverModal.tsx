import { AuthContext } from "@/contexts/auth.context";
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
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import styles from "../../styles.module.scss";
import { BiEdit } from "react-icons/bi";

interface Props {
	id: string;
	setDrivers: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function EditDriverModal({ id, setDrivers }: Props) {
	const { db } = useContext(AuthContext);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [name, setName] = useState<string>("");
	const [age, setAge] = useState<string>("");
	const [gender, setGender] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [phoneRes, setPhoneRes] = useState<string>("");
	const [phoneCom, setPhoneCom] = useState<string>("");
	const [addressRes, setAddressRes] = useState<string>("");
	const [addressCom, setAddressCom] = useState<string>("");
	const [register, setRegister] = useState<string>("");
	const [cnh, setCNH] = useState<string>("");

	useEffect(() => {
		getDriver();
	}, []);

	const getDriver = async () => {
		const docRef = doc(db, "clients", id);
		await getDoc(docRef).then((doc) => {
			if (doc.exists()) {
				setName(doc.data().name);
				setAge(doc.data().age);
				setGender(doc.data().gender);
				setEmail(doc.data().email);
				setPhoneRes(doc.data().phone_residential);
				setPhoneCom(doc.data().phone_commercial);
				setAddressRes(doc.data().address_residential);
				setAddressCom(doc.data().address_commercial);
				setRegister(doc.data().register);
				setCNH(doc.data().cnh);
			}
		});
	};

	async function handleEditDriver() {
		let updatedDriver = {
			name: name,
			age: age,
			gender: gender,
			email: email,
			cnh: cnh,
			address_commercial: addressCom,
			address_residential: addressRes,
			phone_residential: phoneRes,
			phone_commercial: phoneCom,
			role: "client",
			register: register,
			workshops: [""],
		};

		const docRef = doc(db, "clients", id);

		await updateDoc(docRef, updatedDriver).then(() => {
			setDrivers((drivers) =>
				drivers.map((driver) =>
					driver.id === id ? { ...driver, ...updatedDriver } : driver
				)
			);
			onOpenChange();
		});
	}

	return (
		<>
			<button onClick={onOpen}>
				<BiEdit className={styles.addIcon} />
			</button>
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				className={styles.modal}
				size="2xl"
				scrollBehavior="outside"
			>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader
								className={clsx("flex flex-col gap-1", styles.modalTitle)}
							>
								Editar Motorista
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
										{/* <span className={styles.horizontalSpace} /> */}
										{/* <input className={styles.modalInput}
                                            placeholder='Sobrenome' /> */}
									</div>
									<div>
										<input
											className={styles.modalInput}
											placeholder="Idade"
											value={age}
											onChange={(e) => setAge(e.target.value)}
										/>
										<span className={styles.horizontalSpace} />
										<input
											className={styles.modalInput}
											placeholder="Gênero"
											value={gender}
											onChange={(e) => setGender(e.target.value)}
										/>
									</div>
									<div>
										<input
											className={styles.modalInput}
											placeholder="E-mail"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
										/>
									</div>
									<div>
										<input
											className={styles.modalInput}
											placeholder="Celular"
											value={phoneRes}
											onChange={(e) => setPhoneRes(e.target.value)}
										/>
										<span className={styles.horizontalSpace} />
										<input
											className={styles.modalInput}
											placeholder="Telefone"
											value={phoneCom}
											onChange={(e) => setPhoneCom(e.target.value)}
										/>
									</div>
									<div>
										<input
											className={styles.modalInput}
											placeholder="Endereço"
											value={addressRes}
											onChange={(e) => setAddressRes(e.target.value)}
										/>
									</div>
									<div>
										<input
											className={styles.modalInput}
											placeholder="Registro"
											value={register}
											onChange={(e) => setRegister(e.target.value)}
										/>
									</div>
									<div>
										<input
											className={styles.modalInput}
											placeholder="CNH"
											value={cnh}
											onChange={(e) => setCNH(e.target.value)}
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
									onPress={() => {
										handleEditDriver();
									}}
								>
									Editar
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
}
