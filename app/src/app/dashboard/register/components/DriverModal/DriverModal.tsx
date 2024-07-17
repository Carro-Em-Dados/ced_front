import { AuthContext } from "@/contexts/auth.context";
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Select,
	SelectItem,
	useDisclosure,
} from "@nextui-org/react";
import clsx from "clsx";
import {
	addDoc,
	collection,
	doc,
	getDocs,
	query,
	updateDoc,
	where,
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { MdLibraryAdd } from "react-icons/md";
import styles from "../../styles.module.scss";
import { Workshop } from "@/interfaces/workshop.type";

interface Props {
	setDrivers: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function DriverModal({ setDrivers }: Props) {
	const { db, currentUser } = useContext(AuthContext);
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
	const [workshops, setWorkshops] = useState<Workshop[]>([]);
	const [selectedWorkshop, setSelectedWorkshop] = useState<string>("");

	useEffect(() => {
		if (currentUser?.role === "master") {
			loadAllWorkshops();
		}
	}, [currentUser?.role]);

	const handleAddDriver = async () => {
		if (currentUser?.workshops || currentUser?.role === "master") {
			try {
				const querySnapshot = await getDocs(
					query(collection(db, "clients"), where("email", "==", email))
				);

				if (!querySnapshot.empty) {
					const existingDriverDoc = querySnapshot.docs[0];
					const existingDriver = existingDriverDoc.data();

					if (existingDriver.workshops) {
						alert(
							"Já existe um motorista com esse email associado a uma oficina."
						);
						return;
					}

					const updatedDriver = {
						name: name || existingDriver.name,
						age: age || existingDriver.age,
						gender: gender || existingDriver.gender,
						email: email,
						cnh: cnh || existingDriver.cnh,
						address_commercial: addressCom || existingDriver.address_commercial,
						address_residential:
							addressRes || existingDriver.address_residential,
						phone_residential: phoneRes || existingDriver.phone_residential,
						phone_commercial: phoneCom || existingDriver.phone_commercial,
						role: "client",
						register: register || existingDriver.register,
						workshops: selectedWorkshop || existingDriver.workshops,
					};

					await updateDoc(
						doc(db, "clients", existingDriverDoc.id),
						updatedDriver
					);

					setDrivers((drivers) =>
						drivers.map((drv) =>
							drv.email === email ? { ...drv, ...updatedDriver } : drv
						)
					);
					setName("");
					setAge("");
					setGender("");
					setPhoneRes("");
					setPhoneCom("");
					setAddressRes("");
					setAddressCom("");
					setRegister("");
					setCNH("");
					setEmail("");
					onOpenChange();
					return;
				}

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
					workshops:
						currentUser?.role === "master"
							? selectedWorkshop
							: currentUser?.workshops || "",
				};

				const docRef = await addDoc(collection(db, "clients"), driver);
				setDrivers((drivers) => [...drivers, { ...driver, id: docRef.id }]);
				onOpenChange();
			} catch (error) {
				console.log("Erro ao adicionar motorista:", error);
			}
			return;
		}
		console.log("Nenhuma oficina encontrada no seu usuário");
	};

	const queryDrivers = async () => {
		try {
			const q = query(
				collection(db, "clients"),
				where("email", "==", email),
				where("workshops", "==", "")
			);
			const querySnapshot = await getDocs(q);
			if (!querySnapshot.empty) {
				querySnapshot.forEach((doc) => {
					const driverData = doc.data();
					console.log(driverData);
					setName(driverData.name || "");
					setAge(driverData.age || "");
					setGender(driverData.gender || "");
					setPhoneRes(driverData.phone_residential || "");
					setPhoneCom(driverData.phone_commercial || "");
					setAddressRes(driverData.address_residential || "");
					setAddressCom(driverData.address_commercial || "");
					setRegister(driverData.register || "");
					setCNH(driverData.cnh || "");
				});
			} else {
				setName("");
				setAge("");
				setGender("");
				setPhoneRes("");
				setPhoneCom("");
				setAddressRes("");
				setAddressCom("");
				setRegister("");
				setCNH("");
			}
		} catch (error) {
			console.error("Error querying drivers:", error);
		}
	};

	const loadAllWorkshops = async () => {
		try {
			const querySnapshot = await getDocs(collection(db, "workshops"));
			const workshopsList: Workshop[] = querySnapshot.docs.map(
				(doc) =>
					({
						id: doc.id,
						...doc.data(),
					} as Workshop)
			);
			setWorkshops(workshopsList);
		} catch (error) {
			console.error("Error loading workshops: ", error);
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
											placeholder="E-mail"
											type="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											onBlur={queryDrivers}
										/>
									</div>
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
									{currentUser?.role === "master" && (
										<div>
											<Select
												name="workshops"
												className="dark"
												value={selectedWorkshop}
												onChange={(e) => setSelectedWorkshop(e.target.value)}
											>
												{workshops.map((workshop) => (
													<SelectItem
														key={workshop.id}
														value={workshop.id}
													>
														{workshop.fantasy_name}
													</SelectItem>
												))}
											</Select>
										</div>
									)}
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
									disabled={!email}
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
