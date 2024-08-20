import { AuthContext } from "@/contexts/auth.context";
import {
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	useDisclosure,
} from "@nextui-org/react";
import clsx from "clsx";
import { doc, updateDoc } from "firebase/firestore";
import { ReactNode, useContext, useState } from "react";
import styles from "../../styles.module.scss";
import { BiEdit } from "react-icons/bi";
import { Workshop } from "@/interfaces/workshop.type";
import { toast, Zoom } from "react-toastify";
import InputMask from "react-input-mask";

interface Props {
	workshop: Workshop;
	setWorkshops: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function EditOrganization({ workshop, setWorkshops }: Props) {
	const { db } = useContext(AuthContext);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [fantasyName, setFantasyName] = useState(workshop.fantasy_name || "");
	const [contractNumber, setContractNumber] = useState(
		workshop.contract_number || ""
	);
	const [registrationNumber, setRegistrationNumber] = useState(
		workshop.registration_number || ""
	);
	const [corporateName, setCorporateName] = useState(
		workshop.company_name || ""
	);
	const [cnpj, setCnpj] = useState(workshop.cnpj || "");
	const [stateRegistration, setStateRegistration] = useState(
		workshop.state_registration || ""
	);
	const [municipalRegistration, setMunicipalRegistration] = useState(
		workshop.municipal_registration || ""
	);
	const [email, setEmail] = useState(workshop.email || "");
	const [phone, setPhone] = useState(workshop.phone || "");
	const [contact, setContact] = useState(workshop.contact || "");
	const [loading, setLoading] = useState(false);

	const handleEditOrganization = async () => {
		setLoading(true);
		const updatedWorkshop = {
			fantasy_name: fantasyName,
			contract_number: contractNumber,
			registration_number: registrationNumber,
			company_name: corporateName,
			cnpj: cnpj,
			state_registration: stateRegistration,
			municipal_registration: municipalRegistration,
			email: email,
			phone: phone,
			contact: contact,
		};

		try {
			const workshopDocRef = doc(db, "workshops", workshop.id);
			await updateDoc(workshopDocRef, updatedWorkshop);
			setWorkshops((prevWorkshops) =>
				prevWorkshops.map((w) =>
					w.id === workshop.id ? { ...w, ...updatedWorkshop } : w
				)
			);
			onOpenChange();
		} catch (error) {
			toast.error("Erro ao editar organização", {
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
	};

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
								Editar Organização
							</ModalHeader>
							<ModalBody>
								<div className={clsx(styles.form, "flex flex-col gap-4")}>
									<div>
										<Input
											type="text"
											value={fantasyName}
											onChange={(e) => setFantasyName(e.target.value)}
											variant="bordered"
											label="Nome Fantasia*"
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
											min={0}
											label="N° Contrato*"
											type="number"
											value={contractNumber}
											onChange={(e) => setContractNumber(e.target.value)}
											variant="bordered"
											className="dark"
											classNames={{
												input: ["bg-transparent text-white"],
												inputWrapper: [
													"border border-2 !border-white focus:border-white",
												],
											}}
										/>
										<Input
											min={0}
											type="number"
											value={registrationNumber}
											onChange={(e) => setRegistrationNumber(e.target.value)}
											label="N° Cadastro*"
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
											label="Razão Social*"
											value={corporateName}
											onChange={(e) => setCorporateName(e.target.value)}
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
										<InputMask
											mask="99.999.999/9999-99"
											value={cnpj}
											onChange={(e) => setCnpj(e.target.value)}
											maskChar={null}
										>
											{
												((inputProps: any) => (
													<Input
														type="text"
														label="CNPJ*"
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
									<div className="flex flex-row gap-5">
										<Input
											type="text"
											label="Inscrição Estadual"
											value={stateRegistration}
											onChange={(e) => setStateRegistration(e.target.value)}
											variant="bordered"
											className="dark"
											classNames={{
												input: ["bg-transparent text-white"],
												inputWrapper: [
													"border border-2 !border-white focus:border-white",
												],
											}}
										/>
										<Input
											type="text"
											label="Inscrição Municipal"
											value={municipalRegistration}
											onChange={(e) => setMunicipalRegistration(e.target.value)}
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
											label="E-mail*"
											value={email}
											type="email"
											onChange={(e) => setEmail(e.target.value)}
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
											value={phone}
											onChange={(e) => setPhone(e.target.value)}
											maskChar={null}
										>
											{
												((inputProps: any) => (
													<Input
														type="tel"
														label="Telefone*"
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
											value={contact}
											onChange={(e) => setContact(e.target.value)}
											maskChar={null}
										>
											{
												((inputProps: any) => (
													<Input
														{...inputProps}
														type="text"
														label="Contato*"
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
								</div>
							</ModalBody>
							<ModalFooter>
								<Button
									color="default"
									variant="light"
									className="rounded-full px-5 text-white"
									onClick={onClose}
								>
									Cancelar
								</Button>
								<Button
									color="success"
									className={styles.modalButton}
									onClick={() => {
										handleEditOrganization();
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
