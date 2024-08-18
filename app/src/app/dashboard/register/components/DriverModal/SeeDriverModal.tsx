import { AuthContext } from "@/contexts/auth.context";
import {
	Button,
	Input,
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
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ReactNode, useContext, useEffect, useState } from "react";
import styles from "../../styles.module.scss";
import { FaEye } from "react-icons/fa";
import EraseModal, { DeleteModalTypes } from "../EraseModal/EraseModal";
import InputMask from "react-input-mask";
import { toast, Zoom } from "react-toastify";

interface Props {
	id: string;
	setDrivers: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function SeeDriverModal({ id, setDrivers }: Props) {
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
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		getDriver();
	}, []);

	const getDriver = async () => {
		setLoading(true);
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
		setLoading(false);
	};

	async function handleEditDriver() {
		setLoading(true);

		try {
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
		} catch (error) {
			toast.error("Erro ao editar motorista", {
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
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<button onClick={onOpen}>
				<FaEye />
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
								<div className={clsx(styles.form, "flex flex-col gap-4")}>
									<div>
										<Input
											type="text"
											label="Nome"
											value={name}
											onChange={(e) => setName(e.target.value)}
											variant="bordered"
											className="dark"
											classNames={{
												input: ["bg-transparent text-white"],
												inputWrapper: [
													"border border-2 !border-white focus:border-white",
												],
											}}
										/>
									</div>
									<div className="flex flex-row gap-5">
										<Input
											type="number"
											min={18}
											label="Idade"
											value={age}
											onChange={(e) => setAge(e.target.value)}
											variant="bordered"
											className="dark"
											classNames={{
												input: ["bg-transparent text-white"],
												inputWrapper: [
													"border border-2 !border-white focus:border-white",
												],
											}}
										/>
										<Select
											variant="bordered"
											className="dark text-white"
											classNames={{
												trigger: "!border-white rounded-medium",
												value: "text-white",
											}}
											label="Gênero"
											selectedKeys={gender}
											onChange={(e) => setGender(e.target.value)}
										>
											<SelectItem
												key={"m"}
												value={"m"}
											>
												Masculino
											</SelectItem>
											<SelectItem
												key={"f"}
												value={"f"}
											>
												Feminino
											</SelectItem>
										</Select>
									</div>
									<div>
										<Input
											type="text"
											label="E-mail"
											value={email}
											//onChange={(e) => setEmail(e.target.value)}
											disabled
											variant="bordered"
											className="dark"
											classNames={{
												input: ["bg-transparent text-white"],
												inputWrapper: [
													"border border-2 !border-white focus:border-white",
												],
											}}
										/>
									</div>
									<div className="flex flex-row gap-5">
										<InputMask
											mask="(99) 99999-9999"
											value={phoneRes}
											onChange={(e) => setPhoneRes(e.target.value)}
											maskChar={null}
										>
											{
												((inputProps: any) => (
													<Input
														{...inputProps}
														type="text"
														label="Celular"
														variant="bordered"
														className="dark"
														classNames={{
															input: ["bg-transparent text-white"],
															inputWrapper: [
																"border border-2 !border-white focus:border-white",
															],
														}}
													/>
												)) as unknown as ReactNode
											}
										</InputMask>
										<InputMask
											mask="(99) 99999-9999"
											value={phoneCom}
											onChange={(e) => setPhoneCom(e.target.value)}
											maskChar={null}
										>
											{
												((inputProps: any) => (
													<Input
														{...inputProps}
														type="text"
														label="Telefone"
														variant="bordered"
														className="dark"
														classNames={{
															input: ["bg-transparent text-white"],
															inputWrapper: [
																"border border-2 !border-white focus:border-white",
															],
														}}
													/>
												)) as unknown as ReactNode
											}
										</InputMask>
									</div>
									<div>
										<Input
											type="text"
											label="Endereço"
											value={addressRes}
											onChange={(e) => setAddressRes(e.target.value)}
											variant="bordered"
											className="dark"
											classNames={{
												input: ["bg-transparent text-white"],
												inputWrapper: [
													"border border-2 !border-white focus:border-white",
												],
											}}
										/>
									</div>
									<div>
										<Input
											type="text"
											label="Registro"
											value={register}
											onChange={(e) => setRegister(e.target.value)}
											variant="bordered"
											className="dark"
											classNames={{
												input: ["bg-transparent text-white"],
												inputWrapper: [
													"border border-2 !border-white focus:border-white",
												],
											}}
										/>
									</div>
									<div>
										<Input
											type="text"
											label="CNH"
											value={cnh}
											onChange={(e) => setCNH(e.target.value)}
											variant="bordered"
											className="dark"
											classNames={{
												input: ["bg-transparent text-white"],
												inputWrapper: [
													"border border-2 !border-white focus:border-white",
												],
											}}
										/>
									</div>
								</div>
							</ModalBody>
							<ModalFooter>
								<EraseModal
									type={DeleteModalTypes.driver}
									name={name}
									id={id}
									state={setDrivers}
								/>
								<Button
									color="success"
									className={styles.modalButton}
									onClick={() => {
										handleEditDriver();
									}}
									disabled={loading}
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
