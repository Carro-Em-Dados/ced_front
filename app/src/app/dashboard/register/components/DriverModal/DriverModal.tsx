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
import { addDoc, collection } from "firebase/firestore";
import { useContext, useState } from "react";
import { MdLibraryAdd } from "react-icons/md";
import styles from "../../styles.module.scss";

interface Props {
	setDrivers: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function DriverModal({ setDrivers }: Props) {
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

	async function handleAddDriver() {
		let driver = {
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

		const docRef = await addDoc(collection(db, "clients"), driver).then(() => {
			setDrivers((drivers) => [...drivers, driver]);
			onOpenChange();
		});
	}

	return (
		<>
			<Button
				color="success"
				className={styles.button}
				onPress={onOpen}
			>
				<MdLibraryAdd className={styles.addIcon} />
				Adicionar motorista
			</Button>
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
								Adicionar Motorista
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
										handleAddDriver();
										onClose();
									}}
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
